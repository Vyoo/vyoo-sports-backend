import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionParamsSchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly params: {
      readonly schema: {
        readonly [name: string]: SchemaNode
      }
    }
  }
}
