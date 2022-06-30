import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionQuerySchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly query: {
      readonly name: string
      readonly schema: SchemaNode
    }
  }
}
