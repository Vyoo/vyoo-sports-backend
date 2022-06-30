import type * as gremlin from 'gremlin'
import type GremlinSource from './GremlinSource'
import type { Order } from './order'
import type { Statics } from './statics'
import type { Tokens } from './tokens'
import type { WithOptions } from './withOptions'

type GraphTraversalFn = (context: {
  readonly g: GremlinSource

  readonly Order: Order

  readonly __: Statics

  readonly t: Tokens

  readonly TextP: typeof gremlin.process.TextP

  readonly WithOptions: WithOptions
}) => gremlin.process.Traversal

export default GraphTraversalFn
