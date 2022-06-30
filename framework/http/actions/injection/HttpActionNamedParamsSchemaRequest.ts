import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionNamedParamsSchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly params: {
      readonly name: string
      readonly schema: SchemaNode
    }
  }
}
