import type OpenApiSchemaBase from './OpenApiSchemaBase'

export default interface OpenApiNumberSchema
  extends OpenApiSchemaBase<'number' | 'integer', number> {
  format?: undefined | string
  multipleOf?: undefined | number
  maximum?: undefined | number
  exclusiveMaximum?: undefined | boolean
  minimum?: undefined | number
  exclusiveMinimum?: undefined | boolean
}
