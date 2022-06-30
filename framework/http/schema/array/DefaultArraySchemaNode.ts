import type ArraySchemaNode from './ArraySchemaNode'
import type DefaultArrayJsonSchema from './DefaultArrayJsonSchema'
import type DefaultArrayOpenApiSchema from './DefaultArrayOpenApiSchema'

type DefaultArraySchemaNode<T> = ArraySchemaNode<
  T extends { readonly $$out: infer V } ? readonly V[] : unknown[],
  false,
  false,
  DefaultArrayJsonSchema<T>,
  DefaultArrayOpenApiSchema<T>
>

export default DefaultArraySchemaNode
