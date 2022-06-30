import type OpenApiSchema from './OpenApiSchema'
import type OpenApiSchemaBase from './OpenApiSchemaBase'

export default interface OpenApiArraySchema extends OpenApiSchemaBase<'array', any[]> {
  items?: undefined | false | OpenApiSchema
  prefixItems?: undefined | OpenApiSchema[]
  additionalItems?: undefined | boolean
  maxItems?: undefined | number
  minItems?: undefined | number
  uniqueItems?: undefined | boolean
  contains?: undefined | OpenApiSchema
  minContains?: undefined | number
  maxContains?: undefined | number
}
