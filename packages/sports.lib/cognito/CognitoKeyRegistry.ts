import jwkToPem from 'jwk-to-pem'
import type { RSA } from 'jwk-to-pem'
import fetch from 'node-fetch'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import CognitoKeyRegistryStore from './CognitoKeyRegistryStore'
import type CognitoPublicKey from './CognitoPublicKey'

const isPromiseLike = <T>(obj: any): obj is PromiseLike<T> =>
  'then' in obj && typeof obj.then === 'function'

export default class CognitoKeyRegistry {
  get keys() {
    return this.store.keys
  }

  constructor(readonly log = inject(Log), readonly store = inject(CognitoKeyRegistryStore)) {}

  async getKey(poolId: string, kid: string, refreshKey?: boolean): Promise<CognitoPublicKey> {
    const entry = this.keys[poolId]

    if (!refreshKey && entry) {
      const keys = await entry
      return keys[kid]
    }

    const promise = this.getKeys(poolId)
    this.keys[poolId] = promise
    const keys = await promise
    this.keys[poolId] = keys
    return keys[kid]
  }

  async withKey<T>(
    poolId: string,
    kid: string,
    fn: (key: null | CognitoPublicKey) => T | Promise<T>
  ): Promise<T> {
    const entry = this.keys[poolId]

    if (entry) {
      if (isPromiseLike(entry)) {
        const keys = await entry
        const key = keys[kid]
        return await fn(key || null)
      }

      try {
        const key = entry[kid]
        return await fn(key || null)
      } catch (exc) {
        this.log.warn(`[CognitoKeyRegistry] first attempt at decoding token failed\r\n${exc}`)

        const promise = this.getKeys(poolId)
        this.keys[poolId] = promise
        const keys = await promise
        const key = keys[kid]
        return await fn(key || null)
      }
    }

    const promise = this.getKeys(poolId)
    this.keys[poolId] = promise
    const keys = await promise
    const key = keys[kid]
    return await fn(key || null)
  }

  async getKeys(
    poolId: string,
    poolRegion?: undefined | string
  ): Promise<{ readonly [kid: string]: CognitoPublicKey }> {
    try {
      const issuer = this.getIssuer(poolId, poolRegion)
      const uri = `${issuer}/.well-known/jwks.json`

      const res = await fetch(uri)
      const result = await res.json()

      const keys = result.keys.reduce(
        (
          map: {
            [kid: string]: CognitoPublicKey
          },
          key: CognitoPublicKey & RSA
        ) => {
          map[key.kid] = {
            ...key,
            pem: jwkToPem(key),
          }

          return map
        },
        {}
      )

      this.keys[poolId] = keys
      return keys
    } catch (exc) {
      delete this.keys[poolId]
      throw exc
    }
  }

  getIssuer(poolId: string, region?: undefined | string): string {
    if (!region) {
      const underscoreIndex = poolId.indexOf('_')

      if (underscoreIndex < 0) {
        throw new Error(`Could not extract region from pool id "${poolId}"`)
      }

      // eslint-disable-next-line no-param-reassign
      region = poolId.substr(0, underscoreIndex)
    }

    return `https://cognito-idp.${region}.amazonaws.com/${poolId}`
  }
}
