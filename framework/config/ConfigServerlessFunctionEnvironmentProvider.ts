import Service from '&/di/Service'
import inject from '&/di/inject'
import type ServerlessFuncModel from '&/serverless/funcs/ServerlessFuncModel'
import type ServerlessHttpActionModel from '&/serverless/http/actions/ServerlessHttpActionModel'
import ConfigProvider from './ConfigProvider'

const isServerlessFuncModel = (obj: any): obj is ServerlessFuncModel =>
  obj['framework:serverless:func-model'] === true

const isServerlessHttpActionModel = (obj: any): obj is ServerlessHttpActionModel =>
  obj['framework:serverless:http-action-model'] === true

@Service({ id: 'framework:serverless:function-environment-provider' })
export default class ConfigServerlessFunctionEnvironmentProvider {
  constructor(readonly configProvider = inject(ConfigProvider)) {}

  provideEnvironment(model: unknown): typeof process.env {
    if (isServerlessFuncModel(model) || isServerlessHttpActionModel(model)) {
      const keys = this.configProvider.usedEnvironmentVariables.get(model.id)

      if (keys) {
        return Object.fromEntries(
          Object.entries(this.configProvider.env).filter(([key]) => keys.includes(key))
        )
      }
    }

    return {}
  }
}
