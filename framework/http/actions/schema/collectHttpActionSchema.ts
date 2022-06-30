import App from '&/core/App'
import type InjectionInterceptorContext from '&/di/InjectionInterceptorContext'
import type Provider from '&/di/Provider'
import type Resolved from '&/di/Resolved'
import type ServiceRequest from '&/di/ServiceRequest'
import neverProxy from '&/utils/neverProxy'
import type HttpActionTarget from '~/actions/decorators/HttpActionTarget'
import maybeMatchHttpActionSchemaRequest from '~/actions/injection/maybeMatchHttpActionSchemaRequest'
import AllSchemaNode from '~/schema/all/AllSchemaNode'
import type { MutableHttpActionSchema } from './HttpActionSchema'
import HttpActionSchema from './HttpActionSchema'

const RESOLVE_REAL_DEPENDENCIES = true

const collectHttpActionSchemaCore = (
  provider: Provider,
  Action: HttpActionTarget
): HttpActionSchema => {
  const schema: MutableHttpActionSchema = {}

  provider.with(
    {
      injectionInterceptor<D>(
        request: ServiceRequest,
        { pass }: InjectionInterceptorContext<D>
      ): Resolved<D> {
        const match = maybeMatchHttpActionSchemaRequest(request, {
          body: req => {
            schema.body = schema.body
              ? AllSchemaNode.optimize(AllSchemaNode.of([schema.body, req.body.schema]))
              : req.body.schema

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.schemas) {
              schema.serverless.request.schemas = {}
            }

            const { schemas } = schema.serverless.request

            schemas['application/x-www-form-urlencoded'] = schema.body.$$jsonSchema
            schemas['application/json'] = schema.body.$$jsonSchema
          },

          exec: req => {
            schema.result = schema.result
              ? AllSchemaNode.optimize(AllSchemaNode.of([schema.result, req.exec.resultSchema]))
              : req.exec.resultSchema
          },

          headers: req => {
            Object.entries(req.headers.schema).forEach(([name, node]) => {
              if (schema.headers) {
                schema.headers[name] = schema.headers[name]
                  ? AllSchemaNode.optimize(AllSchemaNode.of([schema.headers[name], node]))
                  : node
              } else {
                schema.headers = { [name]: node }
              }
            })

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.headers) {
              schema.serverless.request.parameters.headers = {}
            }

            for (const [name, value] of Object.entries(req.headers.schema)) {
              schema.serverless.request.parameters.headers[name] = {
                required: !value.$$optional,
              }
            }
          },

          namedHeaders: req => {
            const { name, schema: node } = req.headers

            if (schema.headers) {
              schema.headers[name] = schema.headers[name]
                ? AllSchemaNode.optimize(AllSchemaNode.of([schema.headers[name], node]))
                : node
            } else {
              schema.headers = { [name]: node }
            }

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.headers) {
              schema.serverless.request.parameters.headers = {}
            }

            schema.serverless.request.parameters.headers[req.headers.name] = {
              required: !req.headers.schema.$$optional,
            }
          },

          namedParams: req => {
            const { name, schema: node } = req.params

            if (schema.params) {
              schema.params[name] = schema.params[name]
                ? AllSchemaNode.optimize(AllSchemaNode.of([schema.params[name], node]))
                : node
            } else {
              schema.params = { [name]: node }
            }

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.paths) {
              schema.serverless.request.parameters.paths = {}
            }

            schema.serverless.request.parameters.paths[req.params.name] = {
              required: !req.params.schema.$$optional,
            }
          },

          namedQuery: req => {
            const { name, schema: node } = req.query

            if (schema.query) {
              schema.query[name] = schema.query[name]
                ? AllSchemaNode.optimize(AllSchemaNode.of([schema.query[name], node]))
                : node
            } else {
              schema.query = { [name]: node }
            }

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.querystrings) {
              schema.serverless.request.parameters.querystrings = {}
            }

            schema.serverless.request.parameters.querystrings[req.query.name] = {
              required: !req.query.schema.$$optional,
            }
          },

          params: req => {
            Object.entries(req.params.schema).forEach(([name, node]) => {
              if (schema.params) {
                schema.params[name] = schema.params[name]
                  ? AllSchemaNode.optimize(AllSchemaNode.of([schema.params[name], node]))
                  : node
              } else {
                schema.params = { [name]: node }
              }
            })

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.paths) {
              schema.serverless.request.parameters.paths = {}
            }

            for (const [name, value] of Object.entries(req.params.schema)) {
              schema.serverless.request.parameters.paths[name] = {
                required: !value.$$optional,
              }
            }
          },

          query: req => {
            Object.entries(req.query.schema).forEach(([name, node]) => {
              if (schema.query) {
                schema.query[name] = schema.query[name]
                  ? AllSchemaNode.optimize(AllSchemaNode.of([schema.query[name], node]))
                  : node
              } else {
                schema.query = { [name]: node }
              }
            })

            if (!schema.serverless) {
              schema.serverless = {}
            }

            if (!schema.serverless.request) {
              schema.serverless.request = {}
            }

            if (!schema.serverless.request.parameters) {
              schema.serverless.request.parameters = {}
            }

            if (!schema.serverless.request.parameters.querystrings) {
              schema.serverless.request.parameters.querystrings = {}
            }

            for (const [name, value] of Object.entries(req.query.schema)) {
              schema.serverless.request.parameters.querystrings[name] = {
                required: !value.$$optional,
              }
            }
          },
        })

        if (RESOLVE_REAL_DEPENDENCIES && !match[0]) {
          return pass()
        }

        return neverProxy
      },
    },
    interceptedProvider => interceptedProvider.instantiate(Action)
  )

  return schema as HttpActionSchema
}

const collectHttpActionSchema = (
  provider: Provider,
  action: HttpActionTarget
): HttpActionSchema => {
  if (RESOLVE_REAL_DEPENDENCIES) {
    const app = provider.getService(App)

    return app.runInScopeSync(['request', 'init'], scope =>
      collectHttpActionSchemaCore(scope.provider, action)
    )
  }

  return collectHttpActionSchemaCore(provider, action)
}

export default collectHttpActionSchema
