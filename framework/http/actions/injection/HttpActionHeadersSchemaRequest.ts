import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionHeadersSchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly headers: {
      readonly schema: {
        readonly [name: string]: SchemaNode
      }
    }
  }
}
