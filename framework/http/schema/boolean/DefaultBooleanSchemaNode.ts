import type BooleanSchemaNode from './BooleanSchemaNode'
import type DefaultBooleanJsonSchema from './DefaultBooleanJsonSchema'
import type DefaultBooleanOpenApiSchema from './DefaultBooleanOpenApiSchema'

type DefaultBooleanSchemaNode = BooleanSchemaNode<
  boolean,
  false,
  false,
  DefaultBooleanJsonSchema,
  DefaultBooleanOpenApiSchema
>

export default DefaultBooleanSchemaNode
