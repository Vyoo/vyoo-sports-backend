import type AppBuilderCore from './AppBuilderCore'
import type AppBuilderPluginSystem from './AppBuilderPluginSystem'

/**
 * Builder used to create an application instance
 */
type AppBuilder<E> = AppBuilderCore & E & AppBuilderPluginSystem<E>

export default AppBuilder
