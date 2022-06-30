import type DefaultObjectJsonSchema from './DefaultObjectJsonSchema'
import type DefaultObjectOpenApiSchema from './DefaultObjectOpenApiSchema'
import type ObjectSchemaNode from './ObjectSchemaNode'

type DefaultObjectSchemaNode<T> = ObjectSchemaNode<
  {
    [K in keyof T]: T[K] extends { readonly $$out: infer V; readonly $$optional: false }
      ? V
      : unknown
  } & {
    [K in keyof T]?: T[K] extends { readonly $$out: infer V; readonly $$optional: true }
      ? V
      : unknown
  },
  false,
  false,
  DefaultObjectJsonSchema<T>,
  DefaultObjectOpenApiSchema<T>
>

export default DefaultObjectSchemaNode
