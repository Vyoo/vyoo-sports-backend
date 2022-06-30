import * as gremlin from 'gremlin'
import type Nullable from '$/utils/Nullable'
import type Fragment from './Fragment'
import type GraphContext from './GraphContext'
import type Steps from './Steps'
import applyDsl from './applyDsl'
import graphTraversalContext from './graphTraversalContext'
import isFragment from './isFragment'

export default class GraphTraversal extends gremlin.process.GraphTraversal {
  readonly ctx: GraphContext

  constructor(
    graph?: Nullable<gremlin.structure.Graph>,
    strategies?: Nullable<gremlin.process.TraversalStrategies>,
    bytecode?: Nullable<gremlin.process.Bytecode>,
    ctx?: GraphContext
  ) {
    super(graph ?? null, strategies ?? null, bytecode ?? new gremlin.process.Bytecode())

    this.ctx = ctx!

    Object.assign(this, graphTraversalContext)
  }

  withSideEffect(...args: any[]): this {
    const bytecode = (this as any).bytecode as gremlin.process.Bytecode
    bytecode.addSource('withSideEffect', args)
    return this
  }

  withFullTextSearch(queryType?: undefined | string): this {
    this.withSideEffect('Neptune#fts.endpoint', this.ctx.ftsEndpoint)

    if (queryType) {
      this.withSideEffect('Neptune#fts.queryType', queryType)
    }

    return this
  }

  use(...dsls: any[]): this {
    return applyDsl(this, ...dsls)
  }

  protected apply<F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
    f: F,
    ...args: A
  ): this {
    return f.apply(this, args)
  }

  protected fragment(f: (g: Steps) => Steps): Fragment

  protected fragment(maybeFragment: any, f: (g: Steps) => Steps): Fragment

  protected fragment(
    ...args: readonly [f: (g: Steps) => Steps] | [maybeFragment: any, f: (g: Steps) => Steps]
  ): Fragment {
    let f: (g: Steps) => Steps

    if (args.length > 1) {
      if (this.isFragment(args[0])) {
        return args[0]
      }

      f = args[1]!
    } else {
      f = args[0]
    }

    return f
  }

  protected isFragment(obj: any): obj is Fragment {
    return isFragment(obj)
  }

  protected embed(fragment: Fragment): this {
    return fragment(this as any) as this
  }
}
