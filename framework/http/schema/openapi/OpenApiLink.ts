import type OpenApiParameter from './OpenApiParameter'
import type OpenApiRef from './OpenApiRef'
import OpenApiRequestBody from './OpenApiRequestBody'

export default interface OpenApiLink {
  operationRef?: undefined | string
  operationId?: undefined | string
  parameters?: undefined | (OpenApiRef | OpenApiParameter)[]
  requestBody?: undefined | OpenApiRequestBody
  description?: undefined | string
}
