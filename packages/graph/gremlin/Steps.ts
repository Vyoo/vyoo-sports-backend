import type UnionToIntersection from '$/utils/UnionToIntersection'
import type BuiltinSteps from './BuiltinSteps'
import type DslClass from './DslClass'
import type DslSteps from './DslSteps'

type Steps<
  D extends readonly DslClass[] = [],
  U = UnionToIntersection<InstanceType<D[number]>>
> = BuiltinSteps &
  DslSteps<U> & {
    apply<This, F extends (...args: any[]) => any, A extends any[] = Parameters<F>>(
      this: This,
      f: F,
      ...args: A
    ): This
  }

export default Steps
