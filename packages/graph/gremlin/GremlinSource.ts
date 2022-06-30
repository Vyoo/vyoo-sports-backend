import type DslClass from './DslClass'
import type FullTextQueryType from './FullTextQueryType'
import type Steps from './Steps'

type GremlinSource = Steps & {
  withSideEffect(...args: any[]): GremlinSource

  withFullTextSearch(queryType?: undefined | FullTextQueryType): GremlinSource

  use<D extends readonly DslClass[] = []>(...dsl: D): Steps<D>
}

export default GremlinSource
