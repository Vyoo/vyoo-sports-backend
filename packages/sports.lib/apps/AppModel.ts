import fs from 'fs'
import path from 'path'
import type App from '&/core/App'
import type AppBuilder from '&/core/AppBuilder'
import isAppBuilder from '&/core/isAppBuilder'
import type HttpExtensions from '&/http/HttpExtensions'
import type ServerlessExtensions from '&/serverless/ServerlessExtensions'
import ApiActionModel from './ApiActionModel'
import ApiFunctionModel from './ApiFunctionModel'
import ApiRouteModel from './ApiRouteModel'
import type ApiVersionModel from './ApiVersionModel'

export default class AppModel {
  get builder(): AppBuilder<{}> {
    if (this._builder === undefined) {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const appModule = require(this.appFilePath)

      if (
        typeof appModule !== 'object' ||
        appModule.__esModule !== true ||
        !isAppBuilder(appModule.default)
      ) {
        throw new Error(`Invalid app file at ${this.appFilePath}`)
      }

      this._builder = appModule.default as AppBuilder<{}>
    }

    return this._builder
  }

  get app(): App {
    return this.builder.getApp({ build: { skipValidation: true } })
  }

  get actions(): ApiActionModel[] {
    if (this._actions === undefined) {
      const actionsDir = path.join(this.dir, 'actions')

      if (fs.existsSync(actionsDir)) {
        const entries = fs.readdirSync(actionsDir, { withFileTypes: true })

        this._actions = entries
          .map(entry => {
            if (entry.isFile() && entry.name.endsWith('.ts')) {
              return ApiActionModel.create(path.join(actionsDir, entry.name))
            }

            return undefined!
          })
          .filter(Boolean)
      } else {
        this._actions = []
      }
    }

    return this._actions
  }

  get functions(): ApiFunctionModel[] {
    if (this._functions === undefined) {
      const functionsDir = path.join(this.dir, 'functions')

      if (fs.existsSync(functionsDir)) {
        const entries = fs.readdirSync(functionsDir, { withFileTypes: true })

        this._functions = entries
          .map(entry => {
            if (entry.isFile() && entry.name.endsWith('.ts')) {
              return ApiFunctionModel.create(path.join(functionsDir, entry.name))
            }

            return undefined!
          })
          .filter(Boolean)
      } else {
        this._functions = []
      }
    }

    return this._functions
  }

  constructor(
    readonly dir: string,
    readonly appFilePath: string,
    readonly slsFilePath: null | string
  ) {}

  buildRoutes(versions: ApiVersionModel[]): {
    action: ApiActionModel
    routes: ApiRouteModel[]
  }[] {
    const result: {
      action: ApiActionModel
      routes: ApiRouteModel[]
    }[] = []

    versions.forEach(version => {
      version.routes.forEach(route => {
        route.actions.forEach(action => {
          if (action.belongsTo(this)) {
            const entry = result.find(x => x.action.key === action.key)

            if (entry) {
              entry.routes.push(
                ...action.methods.map(method => route.withPrefix(version.string).withMethod(method))
              )
            } else {
              result.push({
                action,
                routes: action.methods.map(method =>
                  route.withPrefix(version.string).withMethod(method)
                ),
              })
            }
          }
        })
      })
    })

    this.actions.forEach(action => {
      if (!action.ver) {
        const entry = result.find(x => x.action.key === action.key)

        if (entry) {
          entry.routes.push(
            ...action.methods.map(method => new ApiRouteModel(method, action.path, [action]))
          )
        } else {
          result.push({
            action,
            routes: action.methods.map(method => new ApiRouteModel(method, action.path, [action])),
          })
        }
      }
    })

    return result
  }

  registerApi(versions: ApiVersionModel[]) {
    const builder = this.builder as AppBuilder<HttpExtensions & ServerlessExtensions>

    if (builder.http && builder.registerAction) {
      const appRoutes = this.buildRoutes(versions)

      appRoutes.forEach(({ action, routes }) => {
        builder.registerAction(action.action, {
          key: action.key,
          handler: action.handler,
          name: action.name,
          mount: routes.map(route => [route.method, route.path] as [string, string]),
        })
      })
    }

    if (builder.serverless && builder.registerFunc) {
      this.functions.forEach($function => {
        builder.registerFunc($function.function, {
          key: $function.key,
          handler: $function.handler,
          name: $function.name,
        })
      })
    }
  }

  _builder?: AppBuilder<{}>

  _actions?: ApiActionModel[]

  _functions?: ApiFunctionModel[]
}
