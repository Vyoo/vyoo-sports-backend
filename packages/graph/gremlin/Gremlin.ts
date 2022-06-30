import * as gremlin from 'gremlin'
import configure from '&/config/configure'
import inject from '&/di/inject'
import type Connection from './Connection'
import type DslClass from './DslClass'
import type Fragment from './Fragment'
import type GraphContext from './GraphContext'
import GraphTraversal from './GraphTraversal'
import type GraphTraversalFn from './GraphTraversalFn'
import type Remote from './Remote'
import Remotes from './Remotes'
import applyDsl from './applyDsl'
import graphTraversalContext from './graphTraversalContext'

export default abstract class Gremlin {
  abstract readonly remote: Remote

  get connection() {
    if (this._connection === undefined) {
      this._connection = this.remote.getConnection()
    }

    return this._connection
  }

  get graph(): gremlin.structure.Graph {
    if (this._graph === undefined) {
      this._graph = this.createGraph()
    }

    return this._graph
  }

  get strategies(): gremlin.process.TraversalStrategies {
    if (this._strategies === undefined) {
      this._strategies = this.createStrategies()
    }

    return this._strategies
  }

  get graphContext(): GraphContext {
    if (this._graphContext === undefined) {
      this._graphContext = {
        partition: this.config.partition,
        ftsEndpoint: this.config.ftsEndpoint,
      }

      if (!this._graphContext.ftsEndpoint) {
        throw new Error(`Missing NEPTUNE_FTS_ENDPOINT`)
      }

      if (!this._graphContext.partition) {
        throw new Error(`Missing NEPTUNE_PARTITION`)
      }
    }

    return this._graphContext
  }

  constructor(
    readonly remotes = inject(Remotes),
    readonly config = configure(({ env }) => ({
      partition: env.NEPTUNE_PARTITION!,
      ftsEndpoint: env.NEPTUNE_FTS_ENDPOINT!,
    }))
  ) {}

  dispose() {
    if (this._connection) {
      this.remote.returnConnection(this._connection)
      delete this._connection
    }
  }

  abstract createGraph(): gremlin.structure.Graph

  abstract createStrategies(): gremlin.process.TraversalStrategies

  fragment(f: GraphTraversalFn): Fragment {
    return steps => {
      const g = Object.create(steps)

      g.use = function use<D extends readonly DslClass[]>(...dsls: D) {
        return applyDsl(this, ...dsls)
      }

      return f({ g, ...graphTraversalContext }) as any
    }
  }

  async first<T>(f: GraphTraversalFn): Promise<undefined | T> {
    const res = await f({
      g: new GraphTraversal(this.graph, this.strategies, null, this.graphContext) as any,
      ...graphTraversalContext,
    }).next()

    return res.done ? undefined : (res.value as T)
  }

  async list<T>(f: GraphTraversalFn): Promise<T[]> {
    const res = await f({
      g: new GraphTraversal(this.graph, this.strategies, null, this.graphContext) as any,
      ...graphTraversalContext,
    }).toList()

    return res as any
  }

  _connection?: Connection

  _graph?: gremlin.structure.Graph

  _strategies?: gremlin.process.TraversalStrategies

  _graphContext?: GraphContext
}
