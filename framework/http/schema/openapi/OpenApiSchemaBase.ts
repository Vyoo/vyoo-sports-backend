import type OpenApiRef from './OpenApiRef'
import type OpenApiSchema from './OpenApiSchema'

export default interface OpenApiSchemaBase<T extends string, V> {
  type: T
  title?: undefined | string
  description?: undefined | string
  nullable?: undefined | boolean
  deprecated?: undefined | boolean
  default?: undefined | V
  example?: undefined | any

  allOf?: undefined | (OpenApiRef | Partial<OpenApiSchema>)[]
  anyOf?: undefined | (OpenApiRef | Partial<OpenApiSchema>)[]
  oneOf?: undefined | (OpenApiRef | Partial<OpenApiSchema>)[]
  not?: undefined | OpenApiRef | Partial<OpenApiSchema>
}
