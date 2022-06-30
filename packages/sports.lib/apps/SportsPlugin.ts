import type App from '&/core/App'
import type AppBuilder from '&/core/AppBuilder'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import type BuildAppContext from '&/core/BuildAppContext'
import isInServerlessContext from '&/serverless/isInServerlessContext'
import ApiModel from './ApiModel'
import type RequiredExtensions from './RequiredExtensions'
import type SportsExtensions from './SportsExtensions'
import createExtensions from './createExtensions'
import registerServices from './registerServices'

export default class SportsPlugin extends AppBuilderPluginBase<
  RequiredExtensions,
  SportsExtensions
> {
  constructor(app: AppBuilder<RequiredExtensions>) {
    super(app)

    registerServices(app.appRegistry)

    this.extensions = createExtensions(app)
  }

  buildApp(context: BuildAppContext<SportsExtensions>): App {
    if (!isInServerlessContext()) {
      const apiModel = ApiModel.instance

      const appModel = apiModel.apps.find(x => x.builder === context.builder)

      appModel?.registerApi(apiModel.versions)

      // const builder = context.builder as AppBuilder<FinalExtensions>
      //
      // builder.directoriesToDiscover.forEach(dir => {
      //   builder.discoverHttpActions(dir)
      //   builder.discoverServerlessFuncs(dir)
      // })
    }

    const app = context.next()

    return app
  }
}
