import type HttpModelBuildContext from '~/HttpModelBuildContext'
import type HttpActionConfig from './HttpActionConfig'

type HttpActionConfigFn =
  | Partial<HttpActionConfig>
  | ((context: HttpModelBuildContext) => Partial<HttpActionConfig>)

export default HttpActionConfigFn
