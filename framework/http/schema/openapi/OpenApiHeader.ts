import OpenApiRef from './OpenApiRef'
import OpenApiSchema from './OpenApiSchema'

export default interface OpenApiHeader {
  description?: undefined | string
  required?: undefined | boolean
  deprecated?: undefined | boolean
  schema: OpenApiRef | OpenApiSchema
}
