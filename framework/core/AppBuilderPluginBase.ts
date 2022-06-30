import type Registry from '&/di/Registry'
import type AppBuilder from './AppBuilder'
import type AppBuilderPlugin from './AppBuilderPlugin'

/**
 * Default base class for {AppBuilderPlugin}
 */
export default abstract class AppBuilderPluginBase<Requirements = {}, Extensions = Requirements>
  implements AppBuilderPlugin<Extensions>
{
  readonly app: AppBuilder<Extensions>

  readonly appRegistry: Registry

  extensions?: Extensions

  constructor(app: AppBuilder<Requirements>) {
    this.app = app as AppBuilder<{}> as AppBuilder<Extensions>
    this.appRegistry = this.app.appRegistry
  }
}
