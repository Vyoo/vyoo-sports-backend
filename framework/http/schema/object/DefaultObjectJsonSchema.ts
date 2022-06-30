import JsonSchemaType from '~/schema/JsonSchemaType'

export default interface DefaultObjectJsonSchema<T> {
  readonly type: 'object'

  readonly required: readonly (keyof T)[]

  readonly properties: {
    readonly [K in keyof T]: JsonSchemaType<T[K]>
  }

  readonly additionalProperties: false
}
