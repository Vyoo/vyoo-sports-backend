import inject from '&/di/inject'
import isInServerlessOfflineContext from '&/serverless/isInServerlessOfflineContext'
import Auth from '$/sports.lib/auth/Auth'
import CognitoService from '$/sports.lib/cognito/CognitoService'
import { Role } from '$/sports.lib/enums'
import { Action } from '~/sports.app'

@Auth(Role.stranger)
@Action({
  serverless: {
    tracing: isInServerlessOfflineContext() ? undefined : 'Active',
  },
})
export default class AuthWhoamiGet {
  constructor(readonly cognitoService = inject(CognitoService)) {}

  exec = Action.exec(
    x =>
      x.object({
        domain: x.string(),
        clientId: x.string(),
        scopes: x.array(x.string()),
        callbackUrls: x.array(x.string()),
        logoutUrls: x.array(x.string()),
      }),
    async () => {
      const pool = await this.cognitoService.describeUserPool()
      const client = await this.cognitoService.describeUserPoolClient()

      return {
        domain: pool.CustomDomain || pool.Domain!,
        clientId: client.ClientId!,
        scopes: client.AllowedOAuthScopes!,
        callbackUrls: client.CallbackURLs!,
        logoutUrls: client.LogoutURLs!,
      }
    }
  )
}
