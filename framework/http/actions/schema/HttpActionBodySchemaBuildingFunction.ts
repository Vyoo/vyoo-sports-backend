import type HttpActionBodySchemaBuilder from './HttpActionBodySchemaBuilder'

export default interface HttpActionBodySchemaBuildingFunction<T> {
  (x: HttpActionBodySchemaBuilder): T
}
