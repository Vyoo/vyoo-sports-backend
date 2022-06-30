import fs from 'fs'
import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import HttpResponse from '&/http/HttpResponse'
import Auth from '$/sports.lib/auth/Auth'
import CognitoService from '$/sports.lib/cognito/CognitoService'
import { Role } from '$/sports.lib/enums'
import { Action } from '~/playground.app'

const playgroundTemplatePath = 'assets/playground.html'
const authCallbackTemplatePath = 'assets/auth-callback.html'

@Action()
@Auth(Role.stranger)
export default class PlaygroundGet {
  constructor(
    readonly request = inject(HttpRequest),
    readonly response = inject(HttpResponse),
    readonly cognitoService = inject(CognitoService)
  ) {}

  async exec(): Promise<void> {
    let templatePath: string
    let templateParams: any

    const code = this.request.query?.find(x => x[0] === 'code')?.[1] ?? null

    if (code) {
      const tokenReq = await this.cognitoService.getTokenRequestObject(code, this.request.rawUrl)
      const loginUri = (await this.cognitoService.getLoginUrl(this.request.rawUrl)).toString()

      templatePath = authCallbackTemplatePath
      templateParams = { tokenReq, loginUri }
    } else {
      const baseUrl = new URL(this.request.rawUrl)
      baseUrl.pathname = baseUrl.pathname.replace(/\/*playground\/?$/, '')
      baseUrl.search = ''
      baseUrl.hash = ''
      // const baseUrl = new URL('https://5fx1xmas87.execute-api.eu-west-3.amazonaws.com/dev')

      const loginUri = (await this.cognitoService.getLoginUrl(this.request.rawUrl)).toString()

      templatePath = playgroundTemplatePath
      templateParams = { baseUri: baseUrl.toString(), loginUri }
    }

    const template = fs.readFileSync(templatePath, { encoding: 'utf8' })

    const text = template.replace('{{PARAMETERS}}', JSON.stringify(templateParams))

    this.response.status(200).type('text/html').body({ text })
  }
}
