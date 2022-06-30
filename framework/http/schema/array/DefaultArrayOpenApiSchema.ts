import OpenApiSchemaType from '~/schema/OpenApiSchemaType'

export default interface DefaultObjectOpenApiSchema<T> {
  readonly type: 'array'

  readonly items: OpenApiSchemaType<T>
}
