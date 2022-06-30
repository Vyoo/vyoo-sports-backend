import HttpActionParamsSchemaBuildingFunction from '~/actions/schema/HttpActionParamsSchemaBuildingFunction'
import SchemaNode from '~/schema/SchemaNode'
import SchemaNodeOut from '~/schema/SchemaNodeOut'

export default interface HttpActionParamsBuilder {
  <T extends { readonly [name: string]: SchemaNode<string> }>(
    schema: HttpActionParamsSchemaBuildingFunction<T>
  ): { [K in keyof T]: SchemaNodeOut<T[K]> }

  <T extends SchemaNode<string>>(
    name: string,
    schema: HttpActionParamsSchemaBuildingFunction<T>
  ): SchemaNodeOut<T>
}
