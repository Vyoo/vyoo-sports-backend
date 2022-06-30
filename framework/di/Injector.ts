import type Provider from './Provider'

/**
 * Supporting class for inject magic function
 */
export default class Injector {
  /**
   * Currently active ambient dependency provider that will be used for injection
   * @type {Provider}
   */
  static currentProvider: Provider

  /**
   * Executes provided function with specified provider as an ambient one, restoring previous provider upon exit
   * @param {Provider} provider
   * @param {() => R} action
   * @returns {R}
   * @template R
   */
  static withProvider<R>(provider: Provider, action: () => R) {
    const { currentProvider } = Injector

    try {
      Injector.currentProvider = provider
      return action()
    } finally {
      Injector.currentProvider = currentProvider
    }
  }
}
