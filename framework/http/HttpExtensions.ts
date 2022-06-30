import type HttpModel from './HttpModel'
import type HttpActionConfigFn from './actions/HttpActionConfigFn'
import type HttpActionMiddlewareClass from './actions/HttpActionMiddlewareClass'
import type HttpActionModel from './actions/HttpActionModel'
import type HttpActionDecoratorCreator from './actions/decorators/HttpActionDecoratorCreator'
import type HttpActionTarget from './actions/decorators/HttpActionTarget'

export default interface HttpExtensions {
  readonly http: {
    readonly model: HttpModel
  }

  registerAction<Target extends HttpActionTarget>(
    target: Target,
    config?: undefined | HttpActionConfigFn
  ): HttpActionModel

  configureActions(config: HttpActionConfigFn): void

  useActionMiddleware<T extends HttpActionMiddlewareClass>(middleware: T): void

  readonly Action: HttpActionDecoratorCreator
}
