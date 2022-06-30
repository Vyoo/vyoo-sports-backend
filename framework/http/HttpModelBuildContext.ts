import type App from '&/core/App'
import type BuildAppContext from '&/core/BuildAppContext'
import type HttpExtensions from './HttpExtensions'

type HttpModelBuildContext = Omit<
  BuildAppContext<Omit<HttpExtensions, 'Action'>>,
  'app' | 'next'
> & {
  readonly app: App
}

export default HttpModelBuildContext
