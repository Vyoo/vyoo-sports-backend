import HttpActionQuerySchemaBuildingFunction from '~/actions/schema/HttpActionQuerySchemaBuildingFunction'
import SchemaNode from '~/schema/SchemaNode'
import SchemaNodeOut from '~/schema/SchemaNodeOut'

export default interface HttpActionQueryBuilder {
  <T extends { readonly [name: string]: SchemaNode<string> }>(
    schema: HttpActionQuerySchemaBuildingFunction<T>
  ): { [K in keyof T]: SchemaNodeOut<T[K]> }

  <T extends SchemaNode<string>>(
    name: string,
    schema: HttpActionQuerySchemaBuildingFunction<T>
  ): SchemaNodeOut<T>
}
