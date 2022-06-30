import type * as gremlin from 'gremlin'
import type UnionToIntersection from '$/utils/UnionToIntersection'
import type BuiltinSteps from './BuiltinSteps'
import type DslClass from './DslClass'
import type Steps from './Steps'

type StaticSteps<
  D extends readonly DslClass[] = [],
  U = UnionToIntersection<InstanceType<D[number]>>
> = { readonly [K in keyof gremlin.process.Statics]: (...args: any[]) => Steps<D, U> } & {
  readonly [K in Exclude<keyof U, keyof BuiltinSteps>]: U[K] extends (...args: infer A) => any
    ? (...args: A) => Steps<D, U>
    : never
} & {
  fail(...args: any[]): Steps<D, U>
}

export default StaticSteps
