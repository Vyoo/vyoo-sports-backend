import inject from '&/di/inject'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionHeadersSchemaRequest from '~/actions/injection/HttpActionHeadersSchemaRequest'
import type HttpActionNamedHeadersSchemaRequest from '~/actions/injection/HttpActionNamedHeadersSchemaRequest'
import type HttpActionHeadersSchemaBuildingFunction from '~/actions/schema/HttpActionHeadersSchemaBuildingFunction'
import SchemaBuilder from '~/schema/SchemaBuilder'
import type HttpActionHeadersBuilder from './HttpActionHeadersBuilder'

const buildHttpActionHeaders: HttpActionHeadersBuilder = (...args: any[]): any => {
  let name: undefined | string
  let build: HttpActionHeadersSchemaBuildingFunction<any>

  if (typeof args[1] !== 'function') {
    build = args[0]
  } else {
    name = args[0]
    build = args[1]
  }

  const schema = build(new SchemaBuilder() as any)

  if (name) {
    const request: HttpActionNamedHeadersSchemaRequest = {
      [httpActionSchemaSymbol]: {
        headers: {
          schema,
          name,
        },
      },
    }

    return inject(request)
  }

  const request: HttpActionHeadersSchemaRequest = {
    [httpActionSchemaSymbol]: {
      headers: {
        schema,
      },
    },
  }

  return inject(request)
}

export default buildHttpActionHeaders
