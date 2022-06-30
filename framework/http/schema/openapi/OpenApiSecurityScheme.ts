type OpenApiSecurityScheme =
  | {
      type: 'http'
      scheme: 'basic' | 'bearer'
    }
  | {
      type: 'apiKey'
      in: 'header' | 'cookie'
      name: string
    }
  | {
      type: 'oauth2'
      flows: {
        implicit?: {
          authorizationUrl: string
          refreshUrl?: undefined | string
          scopes: Record<string, string>
        }
        authorizationCode?: {
          authorizationUrl: string
          tokenUrl: string
          refreshUrl?: undefined | string
          scopes: Record<string, string>
        }
        password?: {
          authorizationUrl: string
          tokenUrl: string
          refreshUrl?: undefined | string
          scopes: Record<string, string>
        }
        clientCredentials?: {
          authorizationUrl: string
          tokenUrl: string
          refreshUrl?: undefined | string
          scopes: Record<string, string>
        }
      }
    }
  | {
      type: 'openIdConnect'
      openIdConnectUrl: string
    }

export default OpenApiSecurityScheme
