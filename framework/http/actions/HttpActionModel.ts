import type Provider from '&/di/Provider'
import emptyArray from '&/utils/emptyArray'
import HttpMetadataManager from '~/HttpMetadataManager'
import type HttpModelBuildContext from '~/HttpModelBuildContext'
import HttpProvider from '~/HttpProvider'
import type HttpActionConfig from './HttpActionConfig'
import type HttpActionConfigFn from './HttpActionConfigFn'
import type HttpActionMiddlewareClass from './HttpActionMiddlewareClass'
import type HttpActionMiddlewareContext from './HttpActionMiddlewareContext'
import type HttpActionTarget from './decorators/HttpActionTarget'
import instantiateAction from './injection/instantiateAction'
import type HttpActionSchema from './schema/HttpActionSchema'
import collectHttpActionSchema from './schema/collectHttpActionSchema'

/**
 * Models an HTTP action of the app
 */
export default class HttpActionModel<
  C extends new (...args: readonly any[]) => { exec(): any } = new (...args: readonly any[]) => {
    exec(): any
  }
> {
  static isHttpActionModel(obj: any): obj is HttpActionModel {
    return obj !== null && typeof obj === 'object' && obj['framework:http:action-model'] === true
  }

  readonly 'framework:http:action-model' = true

  readonly configs: HttpActionConfigFn[] = []

  /**
   * Returns the configuration of the action represented by the model
   * Throws an error if this model was not built
   * @returns {HttpActionConfig}
   */
  get config(): HttpActionConfig {
    if (this._config === undefined) {
      throw new Error(`Action ${this} not built yet`)
    }

    return this._config
  }

  /**
   * Returns the schema of the action represented by the model
   * Throws an error if this model was not built
   * @returns {HttpActionSchema}
   */
  get schema(): HttpActionSchema {
    if (this._schema === undefined) {
      throw new Error(`Action ${this} not built yet`)
    }

    return this._schema
  }

  get middlewares(): readonly HttpActionMiddlewareClass<C>[] {
    if (this._middlewares === undefined) {
      throw new Error(`Action ${this} not built yet`)
    }

    return this._middlewares
  }

  /**
   * Creates a new model representing an action implemented as a `target` class
   * @param {HttpActionTarget} target class implementing an action
   * @param {any} id
   */
  constructor(readonly target: HttpActionTarget & C, readonly id: any) {}

  toString(): string {
    return `<HttpAction ${this.target.name}>`
  }

  configure(config: HttpActionConfigFn): void {
    HttpMetadataManager.addHttpActionConfig(this.target, config)
    this.configs.push(config)
  }

  /**
   * Builds the model finalizing the action configuration and collecting its schema
   */
  build(context: HttpModelBuildContext): void {
    context.builder.onResourceBuild(this, () => {
      const config = this.buildConfig(context)
      const schema = this.buildSchema(context)
      const middlewares = this.buildMiddlewares(context)

      this._config = config
      this._schema = schema
      this._middlewares = middlewares
    })
  }

  buildConfig(context: HttpModelBuildContext): HttpActionConfig {
    const configs = [...context.builder.http.model.actionConfigs, ...this.configs]

    const config = configs.reduce<Partial<HttpActionConfig>>(
      (acc, part) => Object.assign(acc, typeof part === 'function' ? part(context) : part),
      {}
    )

    if (!context.skipValidation && !this.validateConfig(config)) {
      throw new Error(`Invalid configuration for HTTP action ${this}`)
    }

    return config as HttpActionConfig
  }

  validateConfig(config: Partial<HttpActionConfig>): config is HttpActionConfig {
    if (!config.mount?.length) {
      throw new Error(`Mounting info is missing on HTTP action ${this}`)
    }

    return true
  }

  buildSchema(context: HttpModelBuildContext): HttpActionSchema {
    return collectHttpActionSchema(context.app.services, this.target)
  }

  buildMiddlewares(context: HttpModelBuildContext): readonly HttpActionMiddlewareClass<C>[] {
    const globalMiddlewares = context.builder.http.model.actionMiddlewares
    const ownMiddlewares = HttpMetadataManager.getHttpActionMiddlewares(this.target) ?? emptyArray
    const middlewares = [...ownMiddlewares, ...globalMiddlewares]

    middlewares.forEach(middleware => {
      context.app.runInScopeSync(['request', 'init'], scope => {
        scope.provider.instantiate(middleware)
      })
    })

    return middlewares
  }

  prependMiddleware(middleware: HttpActionMiddlewareClass<C>): void {
    HttpMetadataManager.prependHttpActionMiddleware(this.target, middleware)
  }

  appendMiddleware(middleware: HttpActionMiddlewareClass<C>): void {
    HttpMetadataManager.appendHttpActionMiddleware(this.target, middleware)
  }

  executeAction(provider: Provider): Promise<void> {
    if (this.middlewares === undefined) {
      return this.executeActionWithoutMiddlewares(this.createActionInstance(provider), provider)
    }

    let instance: InstanceType<C>

    const getInstance = (): InstanceType<C> => {
      if (instance === undefined) {
        instance = this.createActionInstance(provider)
      }

      return instance
    }

    const middlewareIterator = this.middlewares[Symbol.iterator]()

    const middlewareContext: HttpActionMiddlewareContext<C> = {
      action: this.target as any,

      get actionInstance(): InstanceType<C> {
        return getInstance()
      },

      next: (): Promise<void> => {
        const res = middlewareIterator.next()

        if (res.done) {
          return this.executeActionWithoutMiddlewares(getInstance(), provider)
        }

        const middleware = provider.instantiate(res.value)

        return middleware.exec(middlewareContext)
      },
    }

    return middlewareContext.next()
  }

  async executeActionWithoutMiddlewares(
    instance: InstanceType<C>,
    provider: Provider
  ): Promise<void> {
    const response = provider.getService(HttpProvider).response!

    const result = await instance.exec()

    if (!response.body()) {
      response.body({ value: result })
    }
  }

  createActionInstance(provider: Provider): InstanceType<C> {
    return instantiateAction(provider, this.target)
  }

  _config?: HttpActionConfig

  _schema?: HttpActionSchema

  _middlewares?: readonly HttpActionMiddlewareClass<C>[]
}
