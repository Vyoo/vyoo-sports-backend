import type OpenApiRef from './OpenApiRef'
import type OpenApiSchema from './OpenApiSchema'

export default interface OpenApiContentItem {
  schema: OpenApiRef | OpenApiSchema
}
