import HttpActionResultSchemaBuildingFunction from '~/actions/schema/HttpActionResultSchemaBuildingFunction'
import SchemaNode from '~/schema/SchemaNode'
import SchemaNodeOut from '~/schema/SchemaNodeOut'

export default interface HttpActionExecBuilder {
  <T extends SchemaNode, F extends () => SchemaNodeOut<T> | Promise<SchemaNodeOut<T>>>(
    schema: HttpActionResultSchemaBuildingFunction<T>,
    action: F
  ): F
}
