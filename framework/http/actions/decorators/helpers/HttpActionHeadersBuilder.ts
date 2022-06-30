import HttpActionHeadersSchemaBuildingFunction from '~/actions/schema/HttpActionHeadersSchemaBuildingFunction'
import SchemaNode from '~/schema/SchemaNode'
import SchemaNodeOut from '~/schema/SchemaNodeOut'

export default interface HttpActionHeadersBuilder {
  <T extends { readonly [name: string]: SchemaNode<string> }>(
    schema: HttpActionHeadersSchemaBuildingFunction<T>
  ): { [K in keyof T]: SchemaNodeOut<T[K]> }

  <T extends SchemaNode<string>>(
    name: string,
    schema: HttpActionHeadersSchemaBuildingFunction<T>
  ): SchemaNodeOut<T>
}
