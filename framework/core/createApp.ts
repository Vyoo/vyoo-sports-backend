import type AppBuilder from './AppBuilder'
import AppBuilderImpl from './AppBuilderImpl'

/**
 * Factory method that creates new empty {AppBuilder} instance
 * @returns {AppBuilder}
 */
const createCoreApp = (): AppBuilder<{}> => new AppBuilderImpl<{}>()

export default createCoreApp
