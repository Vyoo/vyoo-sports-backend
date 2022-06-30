import type HttpActionHeadersSchemaBuilder from './HttpActionHeadersSchemaBuilder'

export default interface HttpActionHeadersSchemaBuildingFunction<T> {
  (x: HttpActionHeadersSchemaBuilder): T
}
