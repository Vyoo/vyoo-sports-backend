import type App from './App'
import type BuildAppContext from './BuildAppContext'
import type BuildResourceContext from './BuildResourceContext'

/**
 * Describes a plugin class that can extend the functionality of an {AppBuilder}
 */
export default interface AppBuilderPlugin<E> {
  readonly extensions?: E

  buildApp?(context: BuildAppContext<E>): App

  onResourceBuild?(context: BuildResourceContext<E>): void
}
