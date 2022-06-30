import { URL } from 'url'
import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import HttpResponse from '&/http/HttpResponse'
import CognitoService from '$/sports.lib/cognito/CognitoService'
import { Action } from '~/sports.app'

@Action()
export default class AuthLoginGet {
  constructor(
    readonly cognitoService = inject(CognitoService),
    readonly request = inject(HttpRequest),
    readonly response = inject(HttpResponse)
  ) {}

  async exec(): Promise<void> {
    const info = await this.cognitoService.getAuthenticationFlowInfo()

    const redirectUrl = new URL(this.request.rawUrl)
    redirectUrl.pathname = `/${redirectUrl.pathname.split('/')[1]}/auth/complete`
    redirectUrl.search = ''
    redirectUrl.hash = ''

    const url = new URL(info.url)
    url.pathname = '/login'
    url.searchParams.set('client_id', info.clientId)
    url.searchParams.set('redirect_uri', redirectUrl.toString())
    url.searchParams.set('response_type', 'code')

    this.response.status(307).header('Location', url.toString()).body({ text: 'Redirecting...' })
  }
}
