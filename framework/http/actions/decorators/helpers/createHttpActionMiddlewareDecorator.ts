import HttpMetadataManager from '~/HttpMetadataManager'
import type HttpActionMiddlewareClass from '~/actions/HttpActionMiddlewareClass'
import type HttpActionTarget from '~/actions/decorators/HttpActionTarget'

const createHttpActionMiddlewareDecorator =
  <T extends HttpActionMiddlewareClass>(middleware: T) =>
  <Target extends HttpActionTarget>(target: Target): Target => {
    HttpMetadataManager.appendHttpActionMiddleware(target, middleware)
    return target
  }

export default createHttpActionMiddlewareDecorator
