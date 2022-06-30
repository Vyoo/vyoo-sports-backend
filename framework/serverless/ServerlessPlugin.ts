import type App from '&/core/App'
import type AppBuilder from '&/core/AppBuilder'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import type BuildAppContext from '&/core/BuildAppContext'
import HttpExtensions from '&/http/HttpExtensions'
import type HttpModelBuildContext from '&/http/HttpModelBuildContext'
import type HttpActionConfig from '&/http/actions/HttpActionConfig'
import type HttpActionConfigFn from '&/http/actions/HttpActionConfigFn'
import type HttpActionTarget from '&/http/actions/decorators/HttpActionTarget'
import createHttpActionDecorator from '&/http/actions/decorators/createHttpActionDecorator'
import withHttpActionDecoratorHelpers from '&/http/actions/decorators/helpers/withHttpActionDecoratorHelpers'
import ServerlessContext from './ServerlessContext'
import ServerlessEvent from './ServerlessEvent'
import type ServerlessExtensions from './ServerlessExtensions'
import ServerlessModel from './ServerlessModel'
import ServerlessProvider from './ServerlessProvider'
import ServerlessService from './ServerlessService'
import configure from './configure'
import doServerless from './doServerless'
import createServerlessFuncDecorator from './funcs/createServerlessFuncDecorator'
import type ServerlessHttpActionConfig from './http/actions/ServerlessHttpActionConfig'
import type ServerlessHttpActionConfigFn from './http/actions/ServerlessHttpActionConfigFn'
import type ServerlessHttpActionDecorator from './http/actions/ServerlessHttpActionDecorator'
import createServerlessHttpActionDecorator from './http/actions/createServerlessHttpActionDecorator'

export default class ServerlessPlugin extends AppBuilderPluginBase<{}, ServerlessExtensions> {
  constructor(app: AppBuilder<{}>) {
    super(app)

    const serverlessModel = new ServerlessModel()

    app.appRegistry.registerService(ServerlessModel, { value: serverlessModel })

    app.appRegistry.registerService(ServerlessService, { scope: 'singleton' })

    app.appRegistry.registerService(ServerlessProvider, { scope: 'request' })

    app.appRegistry.registerService(ServerlessEvent, {
      factory({ provider }) {
        return provider.getRequiredService(ServerlessProvider).event
      },
    })

    app.appRegistry.registerService(ServerlessContext, {
      factory({ provider }) {
        return provider.getRequiredService(ServerlessProvider).context
      },
    })

    const { registerAction, configureActions } = app as AppBuilder<HttpExtensions>

    this.extensions = {
      serverless: {
        model: serverlessModel,
      },

      registerAction: (target, config) => {
        let httpConfig: undefined | HttpActionConfigFn
        let serverlessConfig: undefined | ServerlessHttpActionConfigFn

        if (config !== undefined) {
          if (typeof config !== 'function') {
            const { serverless, ...rest } = config
            httpConfig = rest
            serverlessConfig = serverless
          } else {
            httpConfig = context => {
              const { serverless, ...rest } = config(context)
              return rest
            }

            serverlessConfig = context => {
              const { serverless } = config(context as any)
              return serverless ?? {}
            }
          }
        }

        const httpActionModel = registerAction(target, httpConfig)
        return serverlessModel.registerHttpAction(httpActionModel, serverlessConfig)
      },

      configureActions: config => {
        let httpConfig: HttpActionConfigFn
        let serverlessConfig: undefined | ServerlessHttpActionConfigFn

        if (typeof config !== 'function') {
          const { serverless, ...rest } = config
          httpConfig = rest
          serverlessConfig = serverless
        } else {
          httpConfig = context => {
            const { serverless, ...rest } = config(context)
            return rest
          }

          serverlessConfig = context => {
            const { serverless } = config(context as any)
            return serverless ?? {}
          }
        }

        configureActions(httpConfig)

        if (serverlessConfig) {
          serverlessModel.configureHttpActions(serverlessConfig)
        }
      },

      Action: withHttpActionDecoratorHelpers(
        function ServerlessHttpActionCreator(
          this: AppBuilder<any>,
          config?:
            | undefined
            | Partial<
                HttpActionConfig & {
                  readonly serverless: ServerlessHttpActionConfig
                }
              >
            | ((
                context: HttpModelBuildContext
              ) => Partial<HttpActionConfig & { readonly serverless: ServerlessHttpActionConfig }>)
        ): ServerlessHttpActionDecorator {
          let httpConfig: undefined | HttpActionConfigFn
          let serverlessConfig: undefined | ServerlessHttpActionConfigFn

          if (config !== undefined) {
            if (typeof config !== 'function') {
              const { serverless, ...rest } = config
              httpConfig = rest
              serverlessConfig = serverless
            } else {
              httpConfig = context => {
                const { serverless, ...rest } = config(context)
                return rest
              }

              serverlessConfig = context => {
                const { serverless } = config(context as any)
                return serverless ?? {}
              }
            }
          }

          const httpDecorator = createHttpActionDecorator.call(this, httpConfig)

          const serverlessDecorator = createServerlessHttpActionDecorator.call(
            this,
            serverlessConfig
          )

          return <Target extends HttpActionTarget>(target: Target) =>
            serverlessDecorator(httpDecorator(target))
        }.bind(this.app)
      ),

      registerFunc: (target, config) => serverlessModel.registerFunc(target, config),

      configureFuncs: config => serverlessModel.configureFuncs(config),

      Func: createServerlessFuncDecorator.bind(this.app),

      Serverless: doServerless.bind(this.app),

      configureServerless: configure.bind(this.app),
    }
  }

  buildApp(context: BuildAppContext<ServerlessExtensions>): App {
    const app = context.next()

    const model = app.services.getService(ServerlessModel)

    model.build({ ...context, app })

    return app
  }
}
