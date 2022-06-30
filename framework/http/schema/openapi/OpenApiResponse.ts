import type OpenApiContent from './OpenApiContent'
import type OpenApiHeader from './OpenApiHeader'
import type OpenApiLink from './OpenApiLink'
import type OpenApiRef from './OpenApiRef'

export default interface OpenApiResponse {
  description?: undefined | string
  headers?: undefined | Record<string, OpenApiRef | OpenApiHeader>
  links?: undefined | Record<string, OpenApiRef | OpenApiLink>
  content?: undefined | OpenApiContent
}
