import 'reflect-metadata'
import type HttpActionConfigFn from './actions/HttpActionConfigFn'
import type HttpActionMiddlewareClass from './actions/HttpActionMiddlewareClass'
import type HttpActionTarget from './actions/decorators/HttpActionTarget'

export default class HttpMetadataManager {
  static setUnderlyingObject(object: Object, underlyingObject: Object): void {
    const processed: Object[] = [object]

    let current = underlyingObject

    for (;;) {
      const under = Reflect.getMetadata('framework:http:underlying-object', current)

      if (under === undefined) {
        break
      }

      if (processed.includes(under)) {
        throw new Error(`Circular underlying object chain detected`)
      }

      current = under
    }

    Reflect.defineMetadata('framework:http:underlying-object', underlyingObject, object)
  }

  static getRootUnderlyingObject<T extends Object>(object: Object): T {
    let current = object

    for (;;) {
      const underlyingObject = Reflect.getMetadata('framework:http:underlying-object', current)

      if (underlyingObject === undefined) {
        return current as T
      }

      current = underlyingObject
    }
  }

  static getHttpActionId(action: Object): undefined | any {
    const root = HttpMetadataManager.getRootUnderlyingObject(action)
    return Reflect.getMetadata('framework:http:action-id', root)
  }

  static setHttpActionId(action: Object, value: any): void {
    const root = HttpMetadataManager.getRootUnderlyingObject(action)
    Reflect.defineMetadata('framework:http:action-id', value, root)
  }

  static addHttpActionConfig(target: HttpActionTarget, config: HttpActionConfigFn): void {
    const root = HttpMetadataManager.getRootUnderlyingObject(target)

    let existing = Reflect.getMetadata('framework:http:action-config', root)

    if (existing) {
      existing.push(config)
    } else {
      existing = [config]
    }

    Reflect.defineMetadata('framework:http:action-config', existing, root)
  }

  static getHttpActionMiddlewares(
    target: HttpActionTarget
  ): undefined | HttpActionMiddlewareClass[] {
    const root = HttpMetadataManager.getRootUnderlyingObject(target)
    return Reflect.getMetadata('framework:http:action-middlewares', root)
  }

  static appendHttpActionMiddleware(
    target: HttpActionTarget,
    middleware: HttpActionMiddlewareClass
  ): void {
    const root = HttpMetadataManager.getRootUnderlyingObject(target)

    let existing = Reflect.getMetadata('framework:http:action-middlewares', root)

    if (existing) {
      existing.push(middleware)
    } else {
      existing = [middleware]
    }

    Reflect.defineMetadata('framework:http:action-middlewares', existing, root)
  }

  static prependHttpActionMiddleware(
    target: HttpActionTarget,
    middleware: HttpActionMiddlewareClass
  ): void {
    const root = HttpMetadataManager.getRootUnderlyingObject(target)

    let existing = Reflect.getMetadata('framework:http:action-middlewares', root)

    if (existing) {
      existing.unshift(middleware)
    } else {
      existing = [middleware]
    }

    Reflect.defineMetadata('framework:http:action-middlewares', existing, root)
  }
}
