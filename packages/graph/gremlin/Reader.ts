import * as gremlin from 'gremlin'
import Gremlin from './Gremlin'
import PartitionStrategy from './PartitionStrategy'
import ReadOnlyStrategy from './ReadOnlyStrategy'
import graph from './graph'

export default class Reader extends Gremlin {
  get remote() {
    return this.remotes.reader
  }

  createGraph(): gremlin.structure.Graph {
    return graph
  }

  createStrategies(): gremlin.process.TraversalStrategies {
    const strategies = new gremlin.process.TraversalStrategies()

    strategies.addStrategy(new gremlin.driver.RemoteStrategy(this.connection))

    strategies.addStrategy(new ReadOnlyStrategy())

    strategies.addStrategy(
      new PartitionStrategy({
        partitionKey: '_partition',
        writePartition: this.graphContext.partition,
        readPartitions: [this.graphContext.partition],
      })
    )

    return strategies
  }
}
