import * as gremlin from 'gremlin'
import type DslClass from './DslClass'
import GraphTraversal from './GraphTraversal'
import type StaticSteps from './StaticSteps'
// import type Steps from './Steps'
import applyDsl from './applyDsl'

export type StaticsCore = StaticSteps & {
  apply<This, F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
    this: This,
    f: F,
    ...args: A
  ): This
}

export type Statics = StaticsCore & {
  use<D extends readonly DslClass[] = []>(...dsl: D): StaticSteps<D>
}

const createTraversal = (): any => new GraphTraversal() as any

const statics: any = {
  apply(f: any, ...args: any[]) {
    return createTraversal().apply(f, ...args)
  },

  use(...dsls: any[]): StaticSteps {
    return applyDsl({ ...this }, ...dsls)
  },
}

Object.keys(gremlin.process.statics).forEach(key => {
  // const fn = (GraphTraversal.prototype as any)[key]

  // if (typeof fn === 'function') {
  statics[key] = (...args: any[]) => createTraversal()[key](...args)
  // }
})

// const statics = {
//   ...(gremlin.process.statics as unknown as StaticSteps),
//
//   apply<This, F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
//     this: This,
//     f: F,
//     ...args: A
//   ): This {
//     return f.apply(this, args)
//   },
//
//   use(...dsls: any[]): Steps {
//     return applyDsl({ ...statics } as unknown as Steps, ...dsls)
//   },
// }

export default statics as Statics
