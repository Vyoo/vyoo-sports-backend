import type DefaultStringJsonSchema from './DefaultStringJsonSchema'
import type DefaultStringOpenApiSchema from './DefaultStringOpenApiSchema'
import type StringSchemaNode from './StringSchemaNode'

type DefaultStringSchemaNode = StringSchemaNode<
  string,
  false,
  false,
  DefaultStringJsonSchema,
  DefaultStringOpenApiSchema
>

export default DefaultStringSchemaNode
