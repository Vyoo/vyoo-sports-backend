import OpenApiSchemaType from '~/schema/OpenApiSchemaType'

export default interface DefaultObjectOpenApiSchema<T> {
  readonly type: 'object'

  readonly required: readonly (keyof T)[]
  // readonly required: true

  readonly properties: {
    readonly [K in keyof T]: OpenApiSchemaType<T[K]>
  }

  readonly additionalProperties: false
}
