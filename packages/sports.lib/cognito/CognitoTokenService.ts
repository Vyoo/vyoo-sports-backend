import { verify as jwtVerify } from 'jsonwebtoken'
import type { Jwt, JwtHeader, JwtPayload, Secret, VerifyOptions } from 'jsonwebtoken'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import { ClaimName } from '~/enums'
import type CognitoAccessToken from './CognitoAccessToken'
import type CognitoIdentityToken from './CognitoIdentityToken'
import CognitoKeyRegistry from './CognitoKeyRegistry'

// export interface CognitoRefreshToken {
//   header: object
// }

// export interface CognitoTokenHeader {
//   kid: string
//   alg: string
// }

// const verifyToken = promisify<string, string, CognitoToken>(jwt.verify.bind(jwt) as any)

const verifyToken = <C extends boolean>(
  token: string,
  complete: C,
  options: Omit<VerifyOptions, 'complete'>,
  pem: (header: JwtHeader) => Promise<Secret>
): Promise<C extends true ? Jwt : JwtPayload> =>
  new Promise((resolve, reject) => {
    try {
      jwtVerify(
        token,
        (header, callback) =>
          pem(header).then(
            secret => callback(null, secret),
            err => callback(err)
          ),
        { ...options, complete },
        (err, result) => (err ? reject(err) : resolve(result as C extends true ? Jwt : JwtPayload))
      )
    } catch (exc) {
      reject(exc)
    }
  })

export default class CognitoTokenService {
  constructor(readonly log = inject(Log), readonly keyRegistry = inject(CognitoKeyRegistry)) {}

  async decodeToken<T>(
    poolId: string,
    token: string,
    use: T extends CognitoAccessToken ? 'access' : T extends CognitoIdentityToken ? 'id' : never,
    verify: boolean
  ): Promise<T> {
    let header!: JwtHeader

    const payload = await verifyToken(
      token,
      false,
      verify
        ? {
            ignoreExpiration: false,
            ignoreNotBefore: false,
            issuer: this.getIssuer(poolId),
          }
        : {
            ignoreExpiration: true,
            ignoreNotBefore: true,
          },
      hdr => {
        header = hdr
        return this.keyRegistry.getKey(poolId, hdr.kid!, false).then(x => x.pem)
      }
    )

    if ((payload as any).token_use !== use) {
      this.log.error(`token verification failed (use)\r\n`, payload)

      throw new Error(`Claim use is not "${use}" (${header.kid}/${header.alg})`)
    }

    return payload as unknown as T
  }

  decodeAccessToken(poolId: string, token: string, verify: boolean): Promise<CognitoAccessToken> {
    return this.decodeToken<CognitoAccessToken>(poolId, token, 'access', verify)
  }

  async decodeIdToken(
    poolId: string,
    token: string,
    verify: boolean
  ): Promise<CognitoIdentityToken> {
    const info = await this.decodeToken<CognitoIdentityToken>(poolId, token, 'id', verify)

    Object.entries(ClaimName).forEach(([key, name]) => {
      if (typeof info[name] !== 'string') {
        throw new Error(`Invalid ID token: missing ${key} claim`)
      }
    })

    return info
  }

  // getTokenHeader(token: string, use: 'access' | 'id' | 'refresh'): CognitoTokenHeader {
  //   const dotIndex = token.indexOf('.')
  //
  //   if (dotIndex < 0) {
  //     throw new Error('Invalid token')
  //   }
  //
  //   let header: CognitoTokenHeader
  //
  //   try {
  //     const headerBase64 = token.substr(0, dotIndex)
  //     const headerBuffer = Buffer.from(headerBase64, 'base64')
  //     const headerJson = headerBuffer.toString()
  //
  //     header = JSON.parse(headerJson)
  //   } catch (exc) {
  //     this.log.error(`getTokenHeader() error:`, exc)
  //
  //     throw new Error(`Invalid token`)
  //   }
  //
  //   if (use === 'access' || use === 'id') {
  //     if (typeof header !== 'object' || !header.kid || !header.alg) {
  //       throw new Error(`Invalid token header: ${JSON.stringify(header)}`)
  //     }
  //   }
  //
  //   return header
  // }

  getIssuer(poolId: string, region?: undefined | string): string {
    return this.keyRegistry.getIssuer(poolId, region)
  }
}
