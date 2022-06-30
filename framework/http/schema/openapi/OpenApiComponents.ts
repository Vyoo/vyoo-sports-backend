import type OpenApiHeader from './OpenApiHeader'
import type OpenApiLink from './OpenApiLink'
import type OpenApiParameter from './OpenApiParameter'
import type OpenApiRef from './OpenApiRef'
import type OpenApiRequestBody from './OpenApiRequestBody'
import type OpenApiResponse from './OpenApiResponse'
import type OpenApiSchema from './OpenApiSchema'
import type OpenApiSecurityScheme from './OpenApiSecurityScheme'

export default interface OpenApiComponents {
  schemas?: undefined | Record<string, OpenApiRef | OpenApiSchema>
  responses?: undefined | Record<string, OpenApiRef | OpenApiResponse>
  parameters?: undefined | Record<string, OpenApiRef | OpenApiParameter>
  requestBodies?: undefined | Record<string, OpenApiRef | OpenApiRequestBody>
  headers?: undefined | Record<string, OpenApiRef | OpenApiHeader>
  links?: undefined | Record<string, OpenApiRef | OpenApiLink>
  securitySchemes?: undefined | Record<string, OpenApiSecurityScheme>
}
