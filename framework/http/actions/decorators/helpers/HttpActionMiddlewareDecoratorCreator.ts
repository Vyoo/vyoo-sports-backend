import type HttpActionMiddlewareClass from '~/actions/HttpActionMiddlewareClass'
import type HttpActionTarget from '~/actions/decorators/HttpActionTarget'

export default interface HttpActionMiddlewareDecoratorCreator {
  <T extends HttpActionMiddlewareClass>(middleware: T): <Target extends HttpActionTarget>(
    target: Target
  ) => Target
}
