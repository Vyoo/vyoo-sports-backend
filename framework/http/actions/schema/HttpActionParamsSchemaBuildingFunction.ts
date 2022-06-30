import type HttpActionParamsSchemaBuilder from './HttpActionParamsSchemaBuilder'

export default interface HttpActionParamsSchemaBuildingFunction<T> {
  (x: HttpActionParamsSchemaBuilder): T
}
