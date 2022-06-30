import type { Context } from 'aws-lambda'
import Provider from '&/di/Provider'
import ServerlessContext from '~/ServerlessContext'
import ServerlessEvent from '~/ServerlessEvent'
import ServerlessMetadataManager from '~/ServerlessMetadataManager'
import type ServerlessModelBuildContext from '~/ServerlessModelBuildContext'
import type ServerlessFuncConfig from './ServerlessFuncConfig'
import type ServerlessFuncConfigFn from './ServerlessFuncConfigFn'
import type ServerlessFuncTarget from './ServerlessFuncTarget'

export default class ServerlessFuncModel<
  C extends new (...args: readonly any[]) => { exec(event: unknown, context: Context): any } = new (
    ...args: readonly any[]
  ) => {
    exec(event: unknown, context: Context): any
  }
> {
  static isServerlessFuncModel(obj: any): obj is ServerlessFuncModel {
    return (
      obj !== null && typeof obj === 'object' && obj['framework:serverless:func-model'] === true
    )
  }

  readonly 'framework:serverless:func-model' = true

  readonly configs: ServerlessFuncConfigFn[] = []

  get config(): ServerlessFuncConfig {
    if (this._config === undefined) {
      throw new Error(`Action ${this} not built yet`)
    }

    return this._config
  }

  constructor(readonly target: ServerlessFuncTarget & C, readonly id: any) {}

  toString(): string {
    return `<ServerlessFunc ${this.target.name}>`
  }

  configure(config: ServerlessFuncConfigFn): void {
    ServerlessMetadataManager.addServerlessFuncConfig(this.target, config)
    this.configs.push(config)
  }

  build(context: ServerlessModelBuildContext): void {
    context.builder.onResourceBuild(this, () => {
      this._config = this.buildConfig(context)

      context.app.runInScopeSync(['request', 'init'], scope => {
        this.createFuncInstance(scope.provider)
      })
    })
  }

  buildConfig(context: ServerlessModelBuildContext): ServerlessFuncConfig {
    const configs = [...context.builder.serverless.model.funcConfigs, ...this.configs]

    const config = configs.reduce<Partial<ServerlessFuncConfig>>((acc, part) => {
      const cfg = typeof part === 'function' ? part(context) : part
      return Object.assign(acc, cfg, {
        events: [...(acc.events ?? []), ...(cfg.events ?? [])],
      })
    }, {})

    if (!context.skipValidation && !this.validateConfig(config)) {
      throw new Error(`Invalid configuration for serverless function ${this}`)
    }

    return config as ServerlessFuncConfig
  }

  validateConfig(config: Partial<ServerlessFuncConfig>): config is ServerlessFuncConfig {
    if (!config.handler) {
      throw new Error(`Handler configuration is missing on serverless function ${this}`)
    }

    return true
  }

  async executeFunc(provider: Provider): Promise<void> {
    const event = provider.getService(ServerlessEvent)

    const context = provider.getService(ServerlessContext)

    const instance = this.createFuncInstance(provider)

    const result = await instance.exec(event, context)

    return result
  }

  createFuncInstance(provider: Provider): InstanceType<C> {
    return provider.instantiate(this.target, ...([] as any))
  }

  _config?: ServerlessFuncConfig
}
