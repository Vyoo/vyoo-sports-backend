import type DefaultStringSchemaNode from '~/schema/string/DefaultStringSchemaNode'

export default interface HttpActionHeadersSchemaBuilder {
  string(): DefaultStringSchemaNode
}
