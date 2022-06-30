import type DefaultStringSchemaNode from '~/schema/string/DefaultStringSchemaNode'

export default interface HttpActionParamsSchemaBuilder {
  string(): DefaultStringSchemaNode
}
