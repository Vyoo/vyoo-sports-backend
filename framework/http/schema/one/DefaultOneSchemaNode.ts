import type DefaultOneJsonSchema from './DefaultOneJsonSchema'
import type DefaultOneOpenApiSchema from './DefaultOneOpenApiSchema'
import type OneSchemaNode from './OneSchemaNode'

type DefaultAllSchemaNode<L, R> = OneSchemaNode<
  (L extends { readonly $$out: infer V } ? V : unknown) &
    (R extends { readonly $$out: infer V } ? V : unknown),
  L extends { readonly $$optional: true }
    ? true
    : R extends { readonly $$optional: true }
    ? true
    : false,
  L extends { readonly $$nullable: true }
    ? true
    : R extends { readonly $$nullable: true }
    ? true
    : false,
  DefaultOneJsonSchema<L, R>,
  DefaultOneOpenApiSchema<L, R>
>

export default DefaultAllSchemaNode
