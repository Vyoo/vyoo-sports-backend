import type AppBuilder from './AppBuilder'
import appBuilderSymbol from './appBuilderSymbol'

/**
 * Tests if provided object is a valid instance of {AppBuilder}
 * @param obj
 * @returns {obj is AppBuilder<E>}
 */
const isAppBuilder = <E>(obj: any): obj is AppBuilder<E> =>
  typeof obj === 'object' && obj[appBuilderSymbol] === true

export default isAppBuilder
