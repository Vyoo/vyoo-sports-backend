import DefaultStringSchemaNode from '~/schema/string/DefaultStringSchemaNode'

export default interface HttpActionQuerySchemaBuilder {
  string(): DefaultStringSchemaNode
}
