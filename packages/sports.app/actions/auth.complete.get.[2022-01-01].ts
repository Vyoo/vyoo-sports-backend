import { URL, URLSearchParams } from 'url'
import fetch from 'node-fetch'
import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import HttpResponse from '&/http/HttpResponse'
import Log from '&/logging/Log'
import type CognitoAccessToken from '$/sports.lib/cognito/CognitoAccessToken'
import type CognitoIdentityToken from '$/sports.lib/cognito/CognitoIdentityToken'
import CognitoService from '$/sports.lib/cognito/CognitoService'
import CognitoTokenService from '$/sports.lib/cognito/CognitoTokenService'
import { Action } from '~/sports.app'

@Action()
export default class AuthCompleteGet {
  constructor(
    readonly log = inject(Log),
    readonly cognitoService = inject(CognitoService),
    readonly cognitoTokenService = inject(CognitoTokenService),
    readonly request = inject(HttpRequest),
    readonly response = inject(HttpResponse),
    readonly code = Action.query('code', x => x.string()),
    readonly state = Action.query('state', x => x.string().optional())
  ) {}

  async exec(): Promise<any> {
    this.log.debug(`starting to complete oauth flow`)

    // https://aq-vyoo2.auth.eu-west-3.amazoncognito.com/login?client_id=5gmm3sudjmb6kt3lj0duo1861f&redirect_uri=http://localhost:3000/dev/auth/complete&response_type=code

    if (this.state) {
      let redirectTo: URL

      try {
        redirectTo = new URL(this.state)
      } catch (_) {
        redirectTo = new URL(Buffer.from(this.state, 'base64').toString())
      }

      this.log.debug(`redirecting to`, redirectTo, `with code`, this.code)

      redirectTo.searchParams.set('code', this.code)

      this.response
        .status(307)
        .header('Location', redirectTo.toString())
        .body({ text: 'Redirecting...' })

      return
    }

    const { uri, ...req } = await this.cognitoService.getTokenRequestObject(
      this.code,
      this.request.rawUrl
    )

    this.log.debug(`${req.method} ${uri}`, {
      headers: req.headers,
      body: Object.fromEntries(Array.from(new URLSearchParams(req.body))),
    })

    const res = await fetch(uri, req)

    if (res.status !== 200) {
      const responseText = await res.text()

      this.log.error(`auth flow completion failed:\r\n[status: ${res.status}]\r\n${responseText}`)

      throw new Error(`Code exchange failed with status ${res.status}\r\n${responseText}`)
    }

    const data: {
      access_token: string
      id_token: string
      refresh_token: string
      expires_in: number
      token_type: 'Bearer'
    } = await res.json()

    if (this.request.header('accepts')?.join(',').includes('application/json')) {
      this.log.debug(`decoding auth tokens`)

      const poolId = await this.cognitoService.getUserPoolIdByName()

      let accessToken: CognitoAccessToken | { source: string; error: string }
      let idToken: CognitoIdentityToken | { source: string; error: string }

      try {
        accessToken = await this.cognitoTokenService.decodeAccessToken(
          poolId,
          data.access_token,
          true
        )
      } catch (exc) {
        accessToken = { source: data.access_token, error: `${exc}` }
      }

      this.log.debug(`access token:`, accessToken)

      try {
        idToken = await this.cognitoTokenService.decodeIdToken(poolId, data.id_token, true)
      } catch (exc) {
        idToken = { source: data.id_token, error: `${exc}` }
      }

      this.log.debug(`id token:`, accessToken)

      // eslint-disable-next-line consistent-return
      return {
        code: this.code,
        data,
        tokens: {
          access: accessToken,
          id: idToken,
        },
      }
    }

    this.log.debug(`access token:`, data.access_token)
    this.log.debug(`id token:`, data.id_token)
    this.log.debug(`refresh token:`, data.refresh_token)

    this.response
      .status(200)
      .type('text/plain')
      .body({
        text: [
          `ACCESS TOKEN: ${data.access_token}`,
          `ID TOKEN: ${data.id_token}`,
          `REFRESH TOKEN: ${data.refresh_token}`,
        ].join('\r\n\r\n'),
      })
  }
}
