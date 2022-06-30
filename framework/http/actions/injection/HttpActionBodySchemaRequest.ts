import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionBodySchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly body: {
      readonly schema: SchemaNode
    }
  }
}
