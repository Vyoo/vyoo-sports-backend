import type HttpModelBuildContext from '&/http/HttpModelBuildContext'
import type HttpActionConfig from '&/http/actions/HttpActionConfig'
import type HttpActionTarget from '&/http/actions/decorators/HttpActionTarget'
import type HttpActionDecoratorCreatorHelpers from '&/http/actions/decorators/helpers/HttpActionDecoratorCreatorHelpers'
import type ConfigureServerless from './ConfigureServerless'
import type ServerlessMethod from './ServerlessMethod'
import type ServerlessModel from './ServerlessModel'
import type ServerlessFuncConfigFn from './funcs/ServerlessFuncConfigFn'
import type ServerlessFuncDecoratorCreator from './funcs/ServerlessFuncDecoratorCreator'
import type ServerlessFuncModel from './funcs/ServerlessFuncModel'
import type ServerlessFuncTarget from './funcs/ServerlessFuncTarget'
import type ServerlessHttpActionConfig from './http/actions/ServerlessHttpActionConfig'
import type ServerlessHttpActionDecorator from './http/actions/ServerlessHttpActionDecorator'
import type ServerlessHttpActionModel from './http/actions/ServerlessHttpActionModel'

export default interface ServerlessExtensions {
  readonly serverless: {
    readonly model: ServerlessModel
  }

  registerAction<Target extends HttpActionTarget>(
    target: Target,
    config?:
      | undefined
      | Partial<
          HttpActionConfig & {
            readonly serverless: ServerlessHttpActionConfig
          }
        >
      | ((
          context: HttpModelBuildContext
        ) => Partial<HttpActionConfig & { readonly serverless: ServerlessHttpActionConfig }>)
  ): ServerlessHttpActionModel

  configureActions(
    config:
      | Partial<
          HttpActionConfig & {
            readonly serverless: ServerlessHttpActionConfig
          }
        >
      | ((
          context: HttpModelBuildContext
        ) => Partial<HttpActionConfig & { readonly serverless: ServerlessHttpActionConfig }>)
  ): void

  readonly Action: HttpActionDecoratorCreatorHelpers & {
    (
      config?:
        | undefined
        | Partial<
            HttpActionConfig & {
              readonly serverless: ServerlessHttpActionConfig
            }
          >
        | ((
            context: HttpModelBuildContext
          ) => Partial<HttpActionConfig & { readonly serverless: ServerlessHttpActionConfig }>)
    ): ServerlessHttpActionDecorator
  }

  registerFunc<Target extends ServerlessFuncTarget>(
    target: Target,
    config?: undefined | ServerlessFuncConfigFn
  ): ServerlessFuncModel

  configureFuncs(config: ServerlessFuncConfigFn): void

  readonly Func: ServerlessFuncDecoratorCreator

  readonly Serverless: ServerlessMethod

  readonly configureServerless: ConfigureServerless
}
