import type { Context } from 'aws-lambda'
import App from '&/core/App'
import inject from '&/di/inject'
import type ServerlessEvent from './ServerlessEvent'
import ServerlessModel from './ServerlessModel'
import ServerlessProvider from './ServerlessProvider'
import type ServerlessFuncTarget from './funcs/ServerlessFuncTarget'

export default class ServerlessService {
  constructor(readonly app = inject(App), readonly serverlessModel = inject(ServerlessModel)) {}

  async executeFunc(
    target: ServerlessFuncTarget,
    event: unknown,
    context: Context
  ): Promise<unknown> {
    const funcModel = this.serverlessModel.getFuncModel(target)

    return await this.app.runInScope(['request'], async scope => {
      const { provider } = scope

      const serverlessProvider = provider.getService(ServerlessProvider)
      serverlessProvider.handleHandlerStart(event as ServerlessEvent, context)

      return await funcModel.executeFunc(provider)
    })
  }
}
