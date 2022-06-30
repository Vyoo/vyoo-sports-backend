import fs from 'fs'
import type HttpRequest from '&/http/HttpRequest'
import type HttpResponse from '&/http/HttpResponse'
import type CognitoService from '$/sports.lib/cognito/CognitoService'
import type Specs from '~/Specs'
import specsData from '~/assets/specs.json'

const templatePath = 'assets/docs.html'

const serveDocs = async (params: {
  readonly request: HttpRequest
  readonly response: HttpResponse
  readonly cognitoService: CognitoService
  readonly accept: undefined | string
  readonly version?: undefined | string
  readonly versionFromQuery: undefined | string
}) => {
  const specs = specsData as unknown as Specs

  if (params.accept?.toLowerCase()?.includes('application/json')) {
    const matchingSpec =
      (params.version && specs.find(x => x.version === params.version)) || specs[specs.length - 1]

    if (matchingSpec) {
      const spec = { ...matchingSpec.spec }

      spec.paths = Object.fromEntries(
        Object.entries(spec.paths!).map(([key, value]) => [`${params.request.prefix}${key}`, value])
      )

      // const authorizationUrl = await params.cognitoService.getAuthorizationUrl()
      // const tokenUrl = await params.cognitoService.getTokenUrl()
      // const scopes = await params.cognitoService.getScopes()
      //
      // Object.assign(spec.components!.securitySchemas!.oauth2, {
      //   authorizationUrl,
      //   tokenUrl,
      //   scopes: Object.fromEntries(scopes.map(scope => [scope, scope])),
      // })

      const openIdConnectUrl = await params.cognitoService.getOpenIdConfigurationUrl()

      Object.assign(spec.components!.securitySchemes!.openid, {
        openIdConnectUrl,
      })

      params.response
        .status(200)
        .type('application/json')
        .body({
          text: JSON.stringify(spec, null, 2),
        })
    } else {
      throw new Error(`Not found`)
    }
  } else {
    const urls = specs.map(x => ({
      name: x.version,
      url: `${params.request.prefix}/docs/${x.version}`,
    }))

    const version =
      params.versionFromQuery || params.version || specs[specs.length - 1]?.version || null

    const authRedirectUri = `${params.request.prefix}/${version}/auth/complete`

    const client = await params.cognitoService.describeUserPoolClient()

    const authInitObj = {
      clientId: client.ClientId!,
      appName: 'swagger',
      scopes: client.AllowedOAuthScopes!.join(' '),
      // scopes: ['phone', 'email', 'openid', 'profile'].join(' '),
    }

    const template = fs.readFileSync(templatePath, { encoding: 'utf8' })

    params.response
      .status(200)
      .type('text/html')
      .body({
        text: template
          .replace(`{{urls}}`, JSON.stringify(urls))
          .replace(`{{version}}`, JSON.stringify(version))
          .replace(`{{authRedirectUri}}`, JSON.stringify(authRedirectUri))
          .replace(`{{authInitObj}}`, JSON.stringify(authInitObj)),
      })
  }
}

export default serveDocs
