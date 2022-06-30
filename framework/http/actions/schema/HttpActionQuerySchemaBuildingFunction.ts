import type HttpActionQuerySchemaBuilder from './HttpActionQuerySchemaBuilder'

export default interface HttpActionQuerySchemaBuildingFunction<T> {
  (x: HttpActionQuerySchemaBuilder): T
}
