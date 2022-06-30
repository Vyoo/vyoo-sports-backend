import JsonSchemaType from '~/schema/JsonSchemaType'

export default interface DefaultArrayJsonSchema<T> {
  readonly type: 'array'

  readonly items: JsonSchemaType<T>
}
