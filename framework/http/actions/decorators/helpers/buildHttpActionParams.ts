import inject from '&/di/inject'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionNamedParamsSchemaRequest from '~/actions/injection/HttpActionNamedParamsSchemaRequest'
import type HttpActionParamsSchemaRequest from '~/actions/injection/HttpActionParamsSchemaRequest'
import type HttpActionParamsSchemaBuildingFunction from '~/actions/schema/HttpActionParamsSchemaBuildingFunction'
import SchemaBuilder from '~/schema/SchemaBuilder'
import type HttpActionParamsBuilder from './HttpActionParamsBuilder'

const buildHttpActionParams: HttpActionParamsBuilder = (...args: any[]): any => {
  let name: undefined | string
  let build: HttpActionParamsSchemaBuildingFunction<any>

  if (typeof args[1] !== 'function') {
    build = args[0]
  } else {
    name = args[0]
    build = args[1]
  }

  const schema = build(new SchemaBuilder() as any)

  if (name) {
    const request: HttpActionNamedParamsSchemaRequest = {
      [httpActionSchemaSymbol]: {
        params: {
          schema,
          name,
        },
      },
    }

    return inject(request)
  }

  const request: HttpActionParamsSchemaRequest = {
    [httpActionSchemaSymbol]: {
      params: {
        schema,
      },
    },
  }

  return inject(request)
}

export default buildHttpActionParams
