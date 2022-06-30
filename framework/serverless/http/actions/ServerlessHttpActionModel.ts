import type HttpActionModel from '&/http/actions/HttpActionModel'
import type ServerlessModelBuildContext from '~/ServerlessModelBuildContext'
import type ServerlessHttpActionConfig from './ServerlessHttpActionConfig'
import type ServerlessHttpActionConfigFn from './ServerlessHttpActionConfigFn'

export default class ServerlessHttpActionModel {
  static isServerlessHttpActionModel(obj: any): obj is ServerlessHttpActionModel {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      obj['framework:serverless:http-action-model'] === true
    )
  }

  readonly 'framework:serverless:http-action-model' = true

  readonly id: any

  readonly configs: ServerlessHttpActionConfigFn[] = []

  get config(): ServerlessHttpActionConfig {
    if (this._config === undefined) {
      throw new Error(`Action ${this} not built yet`)
    }

    return this._config
  }

  constructor(readonly httpActionModel: HttpActionModel) {
    this.id = httpActionModel.id
  }

  toString(): string {
    return `<ServerlessHttpAction ${this.httpActionModel.target.name}>`
  }

  configure(config: ServerlessHttpActionConfigFn): void {
    this.configs.push(config)
  }

  build(context: ServerlessModelBuildContext): void {
    context.builder.onResourceBuild(this, () => {
      this._config = this.buildConfig(context)
    })
  }

  buildConfig(context: ServerlessModelBuildContext): ServerlessHttpActionConfig {
    const configs = [...context.builder.serverless.model.httpActionConfigs, ...this.configs]

    return configs.reduce<Partial<ServerlessHttpActionConfig>>(
      (acc, part) => Object.assign(acc, typeof part === 'function' ? part(context) : part),
      {}
    )
  }

  _config?: ServerlessHttpActionConfig
}
