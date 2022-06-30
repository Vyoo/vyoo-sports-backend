import inject from '&/di/inject'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionBodySchemaRequest from '~/actions/injection/HttpActionBodySchemaRequest'
import type HttpActionBodySchemaBuildingFunction from '~/actions/schema/HttpActionBodySchemaBuildingFunction'
import SchemaBuilder from '~/schema/SchemaBuilder'
import type SchemaNode from '~/schema/SchemaNode'
import type HttpActionBodyBuilder from './HttpActionBodyBuilder'

const buildHttpActionBody: HttpActionBodyBuilder = <T extends SchemaNode>(
  build: HttpActionBodySchemaBuildingFunction<T>
): any => {
  const schema = build(new SchemaBuilder() as any)

  const request: HttpActionBodySchemaRequest = {
    [httpActionSchemaSymbol]: {
      body: {
        schema,
      },
    },
  }

  return inject(request)
}

export default buildHttpActionBody
