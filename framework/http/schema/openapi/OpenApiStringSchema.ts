import type OpenApiSchemaBase from './OpenApiSchemaBase'

export default interface OpenApiStringSchema extends OpenApiSchemaBase<'string', string> {
  format?: undefined | string
  enum?: undefined | string[]
  maxLength?: undefined | number
  minLength?: undefined | number
  pattern?: undefined | string
}
