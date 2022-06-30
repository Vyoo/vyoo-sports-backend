import HttpActionBodySchemaBuildingFunction from '~/actions/schema/HttpActionBodySchemaBuildingFunction'
import SchemaNode from '~/schema/SchemaNode'
import SchemaNodeOut from '~/schema/SchemaNodeOut'

export default interface HttpActionBodyBuilder {
  <T extends SchemaNode>(schema: HttpActionBodySchemaBuildingFunction<T>): SchemaNodeOut<T>
}
