import App from '&/core/App'
import type Scope from '&/di/Scope'
import inject from '&/di/inject'
import HttpProvider from '&/http/HttpProvider'
import HttpModel from './HttpModel'
import type HttpRequest from './HttpRequest'
import HttpResponse from './HttpResponse'
import type HttpActionTarget from './actions/decorators/HttpActionTarget'

export default class HttpService {
  constructor(readonly app = inject(App), readonly httpModel = inject(HttpModel)) {}

  async executeAction(
    target: HttpActionTarget,
    request: HttpRequest,
    setup?: (scope: Scope) => void | Promise<void>
  ): Promise<HttpResponse> {
    const actionModel = this.httpModel.getActionModel(target)

    return await this.app.runInScope(['request'], async scope => {
      const { provider } = scope

      const httpProvider = provider.getService(HttpProvider)
      httpProvider.handleHandlerStart(request)

      const response = provider.getService(HttpResponse)
      response.type('application/json')

      if (setup) {
        setup(scope)
      }

      const result = await actionModel.executeAction(provider)

      if (!response.body()) {
        response.body({ value: result })
      }

      return response.validate()
    })
  }
}
