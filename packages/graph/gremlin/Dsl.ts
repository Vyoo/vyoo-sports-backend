import * as gremlin from 'gremlin'
// import type UnionToIntersection from '$/utils/UnionToIntersection'
// import type DslArgs from './DslArgs'
// import type DslClass from './DslClass'
// import type DslSteps from './DslSteps'
import type Fragment from './Fragment'
import type GraphContext from './GraphContext'
import type Steps from './Steps'
import type { Order } from './order'
import type { Statics } from './statics'
import type { Tokens } from './tokens'
import type { WithOptions } from './withOptions'

// type TupleToIntersection<T extends any[]> = T extends [infer Head, ...infer Tail]
//   ? Head | TupleToIntersection<Tail>
//   : T extends [infer Only]
//   ? Only
//   : never

// type Builtins = {
//   [K in keyof gremlin.process.Statics]: <This>(this: This, ...args: any[]) => This
// }

export default class Dsl extends gremlin.process.GraphTraversal {
  // protected readonly g = this.use()

  constructor() {
    throw new Error(`This class should not be instantiated directly`)

    // eslint-disable-next-line no-unreachable
    super(null, null, null!)
  }

  protected readonly __: Statics

  protected readonly t: Tokens

  protected readonly Order: Order

  protected readonly TextP: typeof gremlin.process.TextP

  protected readonly WithOptions: WithOptions

  protected readonly ctx!: GraphContext

  // protected step<T, F extends (...args: any[]) => (g: Omit<T, keyof Builtins> & Builtins) => any>(
  //   this: T,
  //   f: F
  // ): F extends (...args: infer A) => any ? <This>(this: This, ...args: A) => This : never

  // protected step2<
  //   D extends readonly Newable<Dsl>[],
  //   A extends any[]
  // >(
  //   use: D,
  //   f: (
  //     this: Omit<UnionToIntersection<InstanceType<D[number]>> & this, keyof Builtins> & Builtins,
  //     ...args: A
  //   ) => any
  // ): <This>(this: This, ...args: A) => This {
  //   return null as any
  // }

  // protected use<D extends readonly Newable<Dsl>[]>(
  //   ...dsls: D
  // ): Omit<UnionToIntersection<InstanceType<D[number]>> & this, keyof Builtins> & Builtins {}
  // ): gremlin.process.Statics & UnionToIntersection<{ [K in keyof D]: InstanceType<D[K]> }[number]> & this {}
  // ): { [K in keyof gremlin.process.Statics]: gremlin.process.Statics[K] extends (...args: infer A) => gremlin.process.Statics ? (...args: A) => this : never } & UnionToIntersection<{ [K in keyof D]: InstanceType<D[K]> }[number]> & this {}
  // ): gremlin.process.Statics & TupleToIntersection<{ [K in keyof D]: InstanceType<D[K]> }> & this {}

  protected apply!: <F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
    f: F,
    ...args: A
  ) => this

  // protected apply<F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
  //   f: F,
  //   ...args: A
  // ): this {
  //   return f.apply(this, args)
  // }

  // protected use<D extends Dsl, U = DslSteps<D, DslSteps<this>>>(dsl: DslClass<D>): U {
  //   return null as any
  // }

  protected fragment!: {
    (f: (g: Steps) => Steps): Fragment
    (maybeFragment: any, f: (g: Steps) => Steps): Fragment
  }

  // protected fragment(f: GraphTraversalFn): Fragment {
  //   return steps => {
  //     const g = Object.create(steps)
  //
  //     g.use = function use<D extends readonly DslClass[]>(...dsls: D) {
  //       return applyDsl(this, ...dsls)
  //     }
  //
  //     return f({ g, ...graphTraversalContext }) as any
  //   }
  // }

  protected isFragment!: (obj: any) => obj is Fragment

  // protected isFragment(obj: any): obj is Fragment {
  //   return isFragment(obj)
  // }

  protected embed!: (fragment: Fragment) => this

  // protected embed(fragment: Fragment): this {
  //   return fragment(this as any) as this
  // }
}
