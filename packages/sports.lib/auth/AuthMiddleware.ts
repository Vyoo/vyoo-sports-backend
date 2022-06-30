import 'reflect-metadata'
import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import HttpResponse from '&/http/HttpResponse'
import type HttpActionMiddleware from '&/http/actions/HttpActionMiddleware'
import HttpActionMiddlewareContext from '&/http/actions/HttpActionMiddlewareContext'
import CognitoService from '~/cognito/CognitoService'
import CognitoTokenService from '~/cognito/CognitoTokenService'
import { ClaimName, MetadataKey, Role } from '~/enums'
import User from './User'
import UserProvider from './UserProvider'

const defaultRequiredRoles = [Role.user]

const roleMapping = [
  [ClaimName.userId, Role.user],
  [ClaimName.soccerLeagueId, Role.soccerUser, Role.soccerLeagueManager],
] as const

export default class AuthMiddleware implements HttpActionMiddleware {
  constructor(
    readonly cognitoService = inject(CognitoService),
    readonly cognitoTokenService = inject(CognitoTokenService),
    readonly userProvider = inject(UserProvider),
    readonly request = inject(HttpRequest),
    readonly response = inject(HttpResponse)
  ) {}

  async exec({ action, next }: HttpActionMiddlewareContext): Promise<void> {
    const user = new User()
    this.userProvider.user = user

    user.userId = null as any
    user.loginId = null as any
    const roles = user.roles as Role[]

    const authHeader = this.request.header('authorization').find(x => x.startsWith('Bearer '))

    // console.log(`[AuthMiddleware] authHeader:`, authHeader)

    if (authHeader) {
      const accessToken = authHeader.substr('Bearer '.length)

      const userPoolId = await this.cognitoService.getUserPoolIdByName()

      const atInfo = await this.cognitoTokenService.decodeAccessToken(userPoolId, accessToken, true)

      user.username = atInfo.username

      roles.push(Role.user)

      const [idToken] = this.request.header('x-id-token')

      // console.log(`[AuthMiddleware] idToken:`, this.request.header('x-id-token'))

      if (idToken) {
        const itInfo = await this.cognitoTokenService.decodeIdToken(userPoolId, idToken, true)

        if (itInfo[ClaimName.userId]) {
          user.userId = itInfo[ClaimName.userId]!
        }

        if (itInfo[ClaimName.loginId]) {
          user.loginId = itInfo[ClaimName.loginId]!
        }

        roleMapping.forEach(([claim, ...role]) => {
          if (itInfo[claim]) {
            roles.push(...role)
          }
        })
      }
    }

    const requiredRoles: undefined | readonly Role[] = Reflect.getMetadata(
      MetadataKey.authRoles,
      action
    )

    if ((requiredRoles ?? defaultRequiredRoles).find(x => !roles.includes(x))) {
      throw new Error(`Unauthorized`)
    }

    await next()
  }
}
