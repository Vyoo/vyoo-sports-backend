import inject from '&/di/inject'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionNamedQuerySchemaRequest from '~/actions/injection/HttpActionNamedQuerySchemaRequest'
import type HttpActionQuerySchemaRequest from '~/actions/injection/HttpActionQuerySchemaRequest'
import type HttpActionQuerySchemaBuildingFunction from '~/actions/schema/HttpActionQuerySchemaBuildingFunction'
import SchemaBuilder from '~/schema/SchemaBuilder'
import type HttpActionQueryBuilder from './HttpActionQueryBuilder'

const buildHttpActionQuery: HttpActionQueryBuilder = (...args: any[]): any => {
  let name: undefined | string
  let build: HttpActionQuerySchemaBuildingFunction<any>

  if (typeof args[1] !== 'function') {
    build = args[0]
  } else {
    name = args[0]
    build = args[1]
  }

  const schema = build(new SchemaBuilder() as any)

  if (name) {
    const request: HttpActionNamedQuerySchemaRequest = {
      [httpActionSchemaSymbol]: {
        query: {
          schema,
          name,
        },
      },
    }

    return inject(request)
  }

  const request: HttpActionQuerySchemaRequest = {
    [httpActionSchemaSymbol]: {
      query: {
        schema,
      },
    },
  }

  return inject(request)
}

export default buildHttpActionQuery
