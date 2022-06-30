import type AppBuilder from '&/core/AppBuilder'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import BuildResourceContext from '&/core/BuildResourceContext'
import ServiceId from '&/di/ServiceId'
import type HttpActionModel from '&/http/actions/HttpActionModel'
import type ServerlessFuncModel from '&/serverless/funcs/ServerlessFuncModel'
import type ServerlessHttpActionModel from '&/serverless/http/actions/ServerlessHttpActionModel'
import type ConfigExtensions from './ConfigExtensions'
import ConfigProvider from './ConfigProvider'
import ConfigServerlessFunctionEnvironmentProvider from './ConfigServerlessFunctionEnvironmentProvider'

const isHttpActionModel = (obj: any): obj is HttpActionModel =>
  obj['framework:http:action-model'] === true

const isServerlessHttpActionModel = (obj: any): obj is ServerlessHttpActionModel =>
  obj['framework:serverless:http-action-model'] === true

const isServerlessFuncModel = (obj: any): obj is ServerlessFuncModel =>
  obj['framework:serverless:func-model'] === true

export default class ConfigPlugin extends AppBuilderPluginBase<{}, ConfigExtensions> {
  constructor(app: AppBuilder<{}>, options?: undefined | { env: typeof process.env }) {
    super(app)

    const configProvider = new ConfigProvider(options)

    app.appRegistry.registerService(ConfigProvider, { value: configProvider })

    app.appRegistry.addRegistration<any, any>(ServiceId.of('framework:config:configuration'), {
      scope: 'transient',
      factory: ({ request, provider }) => {
        const cp = provider.getService(ConfigProvider)
        return cp.provideConfiguration(request.args![0])
      },
    })

    app.appRegistry.registerService(ConfigServerlessFunctionEnvironmentProvider)

    this.extensions = {
      config: {
        provider: configProvider,
      },
    }
  }

  onResourceBuild(context: BuildResourceContext<ConfigExtensions>): void {
    if (
      isHttpActionModel(context.resource) ||
      isServerlessHttpActionModel(context.resource) ||
      isServerlessFuncModel(context.resource)
    ) {
      context.builder.config.provider.beginTrackingSegment(context.resource.id)

      try {
        context.next()
      } finally {
        context.builder.config.provider.endTrackingSegment()
      }
    } else {
      context.next()
    }
  }
}
