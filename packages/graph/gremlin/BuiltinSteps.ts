import type * as gremlin from 'gremlin'
import type Step from './Step'

type BuiltinSteps<T = Omit<gremlin.process.GraphTraversal, keyof gremlin.process.Traversal>> = {
  readonly [K in keyof T]: Step<any[]>
} & {
  fail: Step<any[]>
}

export default BuiltinSteps
