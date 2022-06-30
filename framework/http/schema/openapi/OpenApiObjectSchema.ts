import type OpenApiSchema from './OpenApiSchema'
import type OpenApiSchemaBase from './OpenApiSchemaBase'

export default interface OpenApiObjectSchema
  extends Omit<OpenApiSchemaBase<'object', any>, 'type'> {
  type?: undefined | 'object'
  properties?: undefined | { [key: string]: boolean | OpenApiSchema }
  patternProperties?: undefined | { [pattern: string]: OpenApiSchema }
  additionalProperties?: undefined | boolean | OpenApiSchema
  required?: undefined | string[]
  unevaluatedProperties?: undefined | boolean
  if?: undefined | OpenApiSchema
  then?: undefined | OpenApiObjectSchema
  minProperties?: undefined | number
  maxProperties?: undefined | number
  propertyNames?: undefined | { pattern?: undefined | string }
}
