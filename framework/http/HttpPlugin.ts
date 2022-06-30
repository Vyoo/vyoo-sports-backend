import type App from '&/core/App'
import type AppBuilder from '&/core/AppBuilder'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import type BuildAppContext from '&/core/BuildAppContext'
import type HttpExtensions from './HttpExtensions'
import HttpModel from './HttpModel'
import HttpProvider from './HttpProvider'
import HttpRequest from './HttpRequest'
import HttpResponse from './HttpResponse'
import HttpService from './HttpService'
import type HttpActionMiddlewareClass from './actions/HttpActionMiddlewareClass'
import createHttpActionDecorator from './actions/decorators/createHttpActionDecorator'
import withHttpActionDecoratorHelpers from './actions/decorators/helpers/withHttpActionDecoratorHelpers'

export default class HttpPlugin extends AppBuilderPluginBase<{}, HttpExtensions> {
  constructor(app: AppBuilder<{}>) {
    super(app)

    const httpModel = new HttpModel()

    app.appRegistry.registerService(HttpModel, { value: httpModel })

    app.appRegistry.registerService(HttpService, { scope: 'singleton' })

    app.appRegistry.registerService(HttpProvider, { scope: 'request' })

    app.appRegistry.registerService(HttpRequest, {
      factory: x => {
        const { request } = x.provider.getService(HttpProvider)
        return request ?? null
      },
    })

    app.appRegistry.registerService(HttpResponse, {
      factory: x => {
        const { response } = x.provider.getService(HttpProvider)
        return response ?? null
      },
    })

    this.extensions = {
      http: {
        model: httpModel,
      },

      registerAction: (target, config) => httpModel.registerAction(target, config),

      configureActions: config => httpModel.configureActions(config),

      useActionMiddleware: <T extends HttpActionMiddlewareClass>(middleware: T) =>
        httpModel.appendGlobalActionMiddleware(middleware),

      Action: withHttpActionDecoratorHelpers(createHttpActionDecorator.bind(this.app)),
    }
  }

  buildApp(context: BuildAppContext<HttpExtensions>): App {
    const app = context.next()

    const model = app.services.getService(HttpModel)

    model.build({ ...context, app })

    return app
  }
}
