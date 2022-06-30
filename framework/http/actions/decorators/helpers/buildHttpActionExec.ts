import inject from '&/di/inject'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionExecSchemaRequest from '~/actions/injection/HttpActionExecSchemaRequest'
import type HttpActionResultSchemaBuildingFunction from '~/actions/schema/HttpActionResultSchemaBuildingFunction'
import SchemaBuilder from '~/schema/SchemaBuilder'
import type SchemaNode from '~/schema/SchemaNode'
import type SchemaNodeOut from '~/schema/SchemaNodeOut'
import type HttpActionExecBuilder from './HttpActionExecBuilder'

const buildHttpActionExec: HttpActionExecBuilder = <T extends SchemaNode>(
  build: HttpActionResultSchemaBuildingFunction<T>,
  action: () => SchemaNodeOut<T> | Promise<SchemaNodeOut<T>>
): any => {
  const schema = build(new SchemaBuilder() as any)

  const request: {
    -readonly [K in keyof HttpActionExecSchemaRequest]: HttpActionExecSchemaRequest[K]
  } = action as any

  request[httpActionSchemaSymbol] = {
    exec: {
      resultSchema: schema,
      func: action,
    },
  }

  return inject(request)
}

export default buildHttpActionExec
