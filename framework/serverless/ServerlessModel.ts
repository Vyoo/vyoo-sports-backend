import path from 'path'
import ServiceId from '&/di/ServiceId'
import type HttpActionModel from '&/http/actions/HttpActionModel'
import type ServerlessFunctionEnvironmentProvider from './ServerlessFunctionEnvironmentProvider'
import ServerlessMetadataManager from './ServerlessMetadataManager'
import type ServerlessModelBuildContext from './ServerlessModelBuildContext'
import type ServerlessConfigurationFunction from './config/ServerlessConfigurationFunction'
import type ServerlessConfigurationFunctions from './config/ServerlessConfigurationFunctions'
import type ServerlessFuncConfigFn from './funcs/ServerlessFuncConfigFn'
import ServerlessFuncModel from './funcs/ServerlessFuncModel'
import type ServerlessFuncTarget from './funcs/ServerlessFuncTarget'
import type ServerlessHttpActionConfigFn from './http/actions/ServerlessHttpActionConfigFn'
import ServerlessHttpActionModel from './http/actions/ServerlessHttpActionModel'

const posixRx = /\\/g
const posix = (str: string): string => str.replace(posixRx, '/')

const camelizeRx = /[_\W]+(\w|$)/g
const camelize = (str: string): string =>
  str.replace(camelizeRx, (_, letter, index) =>
    letter[index === 0 ? 'toLowerCase' : 'toUpperCase']()
  )

export default class ServerlessModel {
  readonly httpActions: ServerlessHttpActionModel[] = []

  readonly httpActionConfigs: ServerlessHttpActionConfigFn[] = []

  readonly funcs: ServerlessFuncModel[] = []

  readonly funcConfigs: ServerlessFuncConfigFn[] = []

  readonly serverlessConfigurationFunctions: ServerlessConfigurationFunctions = {}

  registerHttpAction(
    httpActionModel: HttpActionModel,
    config?: undefined | ServerlessHttpActionConfigFn
  ): ServerlessHttpActionModel {
    let serverlessHttpActionModel = this.httpActions.find(x => x.id === httpActionModel.id)

    if (!serverlessHttpActionModel) {
      serverlessHttpActionModel = this.createHttpActionModel(httpActionModel)
      this.httpActions.push(serverlessHttpActionModel)
    }

    if (config !== undefined) {
      serverlessHttpActionModel.configure(config)
    }

    return serverlessHttpActionModel
  }

  createHttpActionModel(httpActionModel: HttpActionModel): ServerlessHttpActionModel {
    return new ServerlessHttpActionModel(httpActionModel)
  }

  configureHttpActions(config: ServerlessHttpActionConfigFn): void {
    this.httpActionConfigs.push(config)
  }

  getFuncModel<Target extends ServerlessFuncTarget>(target: Target): ServerlessFuncModel<Target> {
    const id = ServerlessMetadataManager.getServerlessFuncId(target)

    if (!id) {
      throw new Error(`Target ${target.name} is not a valid serverless function object`)
    }

    const model = this.funcs.find(x => x.id === id)

    if (!model) {
      throw new Error(
        `Target ${target.name} was not added to the current app as a serverless function`
      )
    }

    return model as ServerlessFuncModel<Target>
  }

  registerFunc<Target extends ServerlessFuncTarget>(
    target: Target,
    config?: undefined | ServerlessFuncConfigFn
  ): ServerlessFuncModel {
    let funcId = ServerlessMetadataManager.getServerlessFuncId(target)

    let funcModel = funcId && this.funcs.find(x => x.id === funcId)

    if (!funcModel) {
      if (!funcId) {
        funcId = ServiceId.of(target).value
        ServerlessMetadataManager.setServerlessFuncId(funcId, target)
      }

      funcModel = this.createFuncModel(target, funcId)

      this.funcs.push(funcModel)
    }

    if (config !== undefined) {
      funcModel.configure(config)
    }

    return funcModel
  }

  createFuncModel<Target extends ServerlessFuncTarget>(
    target: Target,
    funcId: any
  ): ServerlessFuncModel<Target> {
    return new ServerlessFuncModel(target, funcId)
  }

  configureFuncs(config: ServerlessFuncConfigFn): void {
    this.funcConfigs.push(config)
  }

  build(context: ServerlessModelBuildContext): void {
    this.httpActions.forEach(httpActionModel => {
      httpActionModel.build(context)
    })

    this.funcs.forEach(funcModel => {
      funcModel.build(context)
    })
  }

  buildServerlessConfiguration(options: {
    readonly resolutionRoot: string
    readonly environmentProvider?: undefined | ServerlessFunctionEnvironmentProvider
  }): {
    functions: ServerlessConfigurationFunctions
  } {
    const { resolutionRoot, environmentProvider } = options

    this.httpActions?.forEach(serverlessActionModel => {
      const { httpActionModel } = serverlessActionModel

      const config = {
        http: httpActionModel.config,
        serverless: serverlessActionModel.config,
      }

      let handler: string
      let name: string

      if (config.serverless.handler) {
        handler = config.serverless.handler
      } else if (config.http.handler) {
        const file = posix(path.relative(resolutionRoot, config.http.handler[0]))

        const ext = path.extname(file)

        handler = `${file.substr(0, file.length - ext.length)}.${config.http.handler[1]}`
      } else {
        throw new Error(`Handler is missing in configuration of an action ${serverlessActionModel}`)
      }

      if (config.serverless.name) {
        name = config.serverless.name
      } else if (config.http.name) {
        name = camelize(config.http.name)
      } else {
        const pos = handler.lastIndexOf('.')
        name = camelize(handler.substr(0, pos))
      }

      const { schema } = httpActionModel

      const events = config.http.mount.map(([method, url]) => ({
        http: {
          method,
          path: url,
          ...schema.serverless,
          // integration: authorizer ? 'lambda' : undefined!,
          // authorizer: authorizer!,
          // integration: 'lambda',
          // authorizer: {
          //   name: 'VyooSportsCognitoAuthorizer',
          //   type: 'COGNITO_USER_POOLS',
          //   arn: isOffline()
          //     ? process.env.COGNITO_USER_POOL_ARN!
          //     : { 'Fn::GetAtt': ['CognitoUserPoolVyooSports', 'Arn'] }, // Fn.GetAtt('CognitoUserPoolVyooSports', 'Arn')
          // },
        },
        // httpApi: {
        //   method,
        //   path: `/${url}`,
        // },
      }))

      const { key, name: _name, handler: _handler, environment, ...rest } = config.serverless

      let actualKey = key || name

      if (!actualKey) {
        const pos = handler.lastIndexOf('.')
        actualKey = camelize(handler.substr(0, pos))
      }

      this.serverlessConfigurationFunctions[actualKey] = {
        handler,
        name,
        events,
        environment: {
          ...(environmentProvider
            ? environmentProvider.provideEnvironment(serverlessActionModel)
            : {}),
          ...environment,
        } as Exclude<ServerlessConfigurationFunction['environment'], undefined>,
        ...(rest as Partial<ServerlessConfigurationFunction>),
      }
    })

    this.funcs?.forEach(funcModel => {
      const { key, handler, name, environment, ...config } = funcModel.config

      let actualKey = key || name

      if (!actualKey) {
        const pos = handler.lastIndexOf('.')
        actualKey = camelize(handler.substr(0, pos))
      }

      this.serverlessConfigurationFunctions[actualKey] = {
        handler,
        name,
        environment: {
          ...(environmentProvider ? environmentProvider.provideEnvironment(funcModel) : {}),
          ...environment,
        } as Exclude<ServerlessConfigurationFunction['environment'], undefined>,
        ...config,
      } as ServerlessConfigurationFunction
    })

    return {
      functions: this.serverlessConfigurationFunctions,
    }
  }
}
