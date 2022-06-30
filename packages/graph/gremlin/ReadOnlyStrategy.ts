import type * as gremlin from 'gremlin'
// eslint-disable-next-line import/no-commonjs
const { ReadOnlyStrategy } = require('gremlin/lib/process/traversal-strategy')

export default ReadOnlyStrategy as new () => gremlin.process.TraversalStrategy
