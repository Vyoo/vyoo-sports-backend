import type { Context } from 'aws-lambda'
import type App from '&/core/App'
import type GetAppOptions from '&/core/GetAppOptions'
import ServerlessMetadataManager from '~/ServerlessMetadataManager'
import type ServerlessModel from '~/ServerlessModel'
import ServerlessService from '~/ServerlessService'
import type ServerlessFunc from './ServerlessFunc'
import type ServerlessFuncConfigFn from './ServerlessFuncConfigFn'
import type ServerlessFuncDecorator from './ServerlessFuncDecorator'
import type ServerlessFuncTarget from './ServerlessFuncTarget'

const createServerlessFuncDecorator = function ServerlessFuncCreator(
  this: {
    getApp(options?: undefined | GetAppOptions): App

    readonly serverless: {
      readonly model: ServerlessModel
    }
  },
  config?: undefined | ServerlessFuncConfigFn
): ServerlessFuncDecorator {
  return <Target extends ServerlessFuncTarget>(target: Target): ServerlessFunc<Target> => {
    const funcModel = this.serverless.model.registerFunc(target, config)

    const proxy = new Proxy(target, {
      apply: async (
        currentTarget: Target,
        _thisArg: any,
        argArray: [event: unknown, context: Context]
      ): Promise<unknown> => {
        process.env.IN_SERVERLESS_CONTEXT = 'true'

        const [event, context] = argArray

        const app = this.getApp({
          build: {
            skipValidation: true,
          },
        })

        const serverlessService = app.services.getRequiredService(ServerlessService)

        const result = await serverlessService.executeFunc(currentTarget, event, context)

        return result
      },
    }) as ServerlessFunc<Target>

    ServerlessMetadataManager.setServerlessFuncId(proxy, funcModel.id)
    this.serverless.model.registerFunc(proxy)

    return proxy
  }
}

export default createServerlessFuncDecorator
