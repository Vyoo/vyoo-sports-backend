import type Dsl from './Dsl'

type DslClass<TInstance extends Dsl = Dsl> = new () => TInstance

export default DslClass
