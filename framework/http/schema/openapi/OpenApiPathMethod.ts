import type OpenApiParameter from './OpenApiParameter'
import type OpenApiRef from './OpenApiRef'
import type OpenApiRequestBody from './OpenApiRequestBody'
import type OpenApiResponse from './OpenApiResponse'

export default interface OpenApiPathMethod {
  description?: undefined | string
  tags?: undefined | string[]
  summary?: undefined | string
  operationId?: undefined | string
  parameters?: (OpenApiRef | OpenApiParameter)[]
  requestBody?: OpenApiRef | OpenApiRequestBody
  responses: Record<string, OpenApiRef | OpenApiResponse>
}
