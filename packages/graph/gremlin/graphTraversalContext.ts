import * as gremlin from 'gremlin'
import order from './order'
import statics from './statics'
import tokens from './tokens'
import withOptions from './withOptions'

const graphTraversalContext = {
  Order: order,
  __: statics,
  t: tokens,
  TextP: gremlin.process.TextP,
  WithOptions: withOptions,
}

export default graphTraversalContext
