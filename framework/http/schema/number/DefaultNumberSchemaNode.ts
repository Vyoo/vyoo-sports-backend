import type DefaultNumberJsonSchema from './DefaultNumberJsonSchema'
import type DefaultNumberOpenApiSchema from './DefaultNumberOpenApiSchema'
import type NumberSchemaNode from './NumberSchemaNode'

type DefaultNumberSchemaNode = NumberSchemaNode<
  number,
  false,
  false,
  DefaultNumberJsonSchema,
  DefaultNumberOpenApiSchema
>

export default DefaultNumberSchemaNode
