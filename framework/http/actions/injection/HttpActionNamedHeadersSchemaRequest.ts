import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionNamedHeadersSchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly headers: {
      readonly name: string
      readonly schema: SchemaNode
    }
  }
}
