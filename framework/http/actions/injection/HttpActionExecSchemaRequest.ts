import type httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type SchemaNode from '~/schema/SchemaNode'

export default interface HttpActionExecSchemaRequest {
  readonly [httpActionSchemaSymbol]: {
    readonly exec: {
      readonly resultSchema: SchemaNode
      readonly func: () => unknown
    }
  }
}
