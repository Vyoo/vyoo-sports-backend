import type BuiltinSteps from './BuiltinSteps'
import type Step from './Step'

type DslSteps<U> = {
  readonly [K in Exclude<keyof U, keyof BuiltinSteps>]: U[K] extends (...args: infer A) => any
    ? Step<A>
    : never
}

export default DslSteps
