import App from './App'
import AppBuilder from './AppBuilder'

/**
 * Context of an {AppBuilder.build} operation that can be
 * used to share information between participating plugins
 */
export default interface BuildAppContext<Extensions> {
  /**
   * An {App} instance that is being built
   * Does not contain dependency container yet
   */
  readonly app: Omit<App, 'container' | 'services'>

  /**
   * {AppBuilder} instance on which {build} method was called
   */
  readonly builder: AppBuilder<Extensions>

  readonly skipValidation: boolean

  /**
   * Calls the next builder in the pipeline returning the fully
   * built {App} instance that has dependency container set up
   * @returns {App}
   */
  next(): App
}
