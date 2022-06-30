import type AllSchemaNode from './AllSchemaNode'
import type DefaultAllJsonSchema from './DefaultAllJsonSchema'
import type DefaultAllOpenApiSchema from './DefaultAllOpenApiSchema'

type DefaultAllSchemaNode<L, R> = AllSchemaNode<
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
  DefaultAllJsonSchema<L, R>,
  DefaultAllOpenApiSchema<L, R>
>

export default DefaultAllSchemaNode
