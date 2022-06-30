import ServiceId from '&/di/ServiceId'
import HttpMetadataManager from './HttpMetadataManager'
import type HttpModelBuildContext from './HttpModelBuildContext'
import HttpActionConfigFn from './actions/HttpActionConfigFn'
import type HttpActionMiddlewareClass from './actions/HttpActionMiddlewareClass'
import HttpActionModel from './actions/HttpActionModel'
import type HttpActionTarget from './actions/decorators/HttpActionTarget'
import type OpenApi from './schema/openapi/OpenApi'
import OpenApiParameterLocation from './schema/openapi/OpenApiParameterLocation'
import type OpenApiPath from './schema/openapi/OpenApiPath'
import type OpenApiPathMethod from './schema/openapi/OpenApiPathMethod'
import type OpenApiPaths from './schema/openapi/OpenApiPaths'

export default class HttpModel {
  readonly actions: HttpActionModel[] = []

  readonly actionConfigs: HttpActionConfigFn[] = []

  readonly actionMiddlewares: HttpActionMiddlewareClass[] = []

  getActionModel(target: HttpActionTarget): HttpActionModel {
    const id = HttpMetadataManager.getHttpActionId(target)

    if (!id) {
      throw new Error(`Target ${target.name} is not a valid HTTP action object`)
    }

    const model = this.actions.find(x => x.id === id)

    if (!model) {
      throw new Error(`Target ${target.name} was not added to the current app as an HTTP action`)
    }

    return model
  }

  registerAction(
    target: HttpActionTarget,
    config?: undefined | HttpActionConfigFn
  ): HttpActionModel {
    const root = HttpMetadataManager.getRootUnderlyingObject<HttpActionTarget>(target)

    let actionId = HttpMetadataManager.getHttpActionId(root)

    let actionModel = actionId && this.actions.find(x => x.id === actionId)

    if (!actionModel) {
      if (!actionId) {
        actionId = ServiceId.of(root).value
        HttpMetadataManager.setHttpActionId(actionId, root)
      }

      actionModel = this.createActionModel(root, actionId)

      this.actions.push(actionModel)
    }

    if (config !== undefined) {
      actionModel.configure(config)
    }

    return actionModel
  }

  createActionModel(target: HttpActionTarget, actionId: any): HttpActionModel {
    return new HttpActionModel(target, actionId)
  }

  configureActions(config: HttpActionConfigFn): void {
    this.actionConfigs.push(config)
  }

  appendGlobalActionMiddleware<T extends HttpActionMiddlewareClass>(middleware: T): void {
    this.actionMiddlewares.push(middleware)
  }

  build(context: HttpModelBuildContext): void {
    this.actions.forEach(actionModel => {
      actionModel.build(context)
    })
  }

  getOpenApiSpec(options?: {
    filter?: {
      actions?(actionModel: HttpActionModel): boolean
    }
  }): Omit<OpenApi, 'info'> {
    const paths: OpenApiPaths = {}

    this.actions.forEach(actionModel => {
      if (!options?.filter?.actions || options.filter.actions(actionModel)) {
        const { config, schema } = actionModel

        config.mount.forEach(([method, path]) => {
          const meth: OpenApiPathMethod = {
            responses: {},
          }

          const key = `/${path}`

          const entry = paths[key] as OpenApiPath<Record<string, OpenApiPathMethod>>

          if (entry) {
            entry[method] = meth
          } else {
            paths[key] = { [method]: meth }
          }

          meth.parameters = []

          if (schema.headers) {
            Object.entries(schema.headers).forEach(([name, node]) => {
              meth.parameters!.push({
                in: OpenApiParameterLocation.header,
                name,
                // description: node.$$description,
                // deprecated: node.$$deprecated,
                required: !node.$$optional,
                schema: node.$$openApiSchema,
              })
            })
          }

          const pathParamRx = /\{(?<name>.+?)(<type>\?|\+)?}/g

          for (let match = pathParamRx.exec(key); match; match = pathParamRx.exec(key)) {
            const { name, type } = match.groups!

            const node = schema.params?.[name]

            meth.parameters!.push({
              in: OpenApiParameterLocation.path,
              name: `${name}${type || ''}`,
              // description: node.$$description,
              // deprecated: node.$$deprecated,
              required: node ? !node.$$optional : type !== '?',
              schema: node?.$$openApiSchema ?? { type: 'string' },
            })
          }

          if (schema.query) {
            Object.entries(schema.query).forEach(([name, node]) => {
              meth.parameters!.push({
                in: OpenApiParameterLocation.query,
                name,
                // description: node.$$description,
                // deprecated: node.$$deprecated,
                ...(node.$$optional ? {} : { required: true }),
                required: !node.$$optional,
                schema: node.$$openApiSchema,
              })
            })
          }

          if (schema.body && !['option', 'head', 'get'].includes(method.toLowerCase())) {
            meth.requestBody = {
              // required: !schema.body.$$optional,
              content: {
                'application/json': {
                  schema: schema.body.$$openApiSchema,
                },
              },
            }
          }

          meth.responses['200'] = {
            description: 'success',
            content: schema.result
              ? {
                  'application/json': {
                    schema: schema.result.$$openApiSchema,
                  },
                }
              : undefined,
          }
        })
      }
    })

    return {
      openapi: '3.0.3',
      paths,
    }
  }
}
