import type SchemaNode from '~/schema/SchemaNode'
import type HttpActionResultSchemaBuilder from './HttpActionResultSchemaBuilder'

export default interface HttpActionResultSchemaBuildingFunction<T extends SchemaNode> {
  (x: HttpActionResultSchemaBuilder): T
}
