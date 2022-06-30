import type * as gremlin from 'gremlin'
// eslint-disable-next-line import/no-commonjs
const { PartitionStrategy } = require('gremlin/lib/process/traversal-strategy')

export default PartitionStrategy as new (options: {
  readonly partitionKey: string
  readonly writePartition: string
  readonly readPartitions: readonly string[]
}) => gremlin.process.TraversalStrategy
