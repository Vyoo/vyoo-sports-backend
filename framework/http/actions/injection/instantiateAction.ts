import type InjectionInterceptorContext from '&/di/InjectionInterceptorContext'
import type Provider from '&/di/Provider'
import type Resolved from '&/di/Resolved'
import type ServiceRequest from '&/di/ServiceRequest'
import HttpRequest from '~/HttpRequest'
import type HttpActionTarget from '~/actions/decorators/HttpActionTarget'
import ObjectSchemaNode from '~/schema/object/ObjectSchemaNode'
import maybeMatchHttpActionSchemaRequest from './maybeMatchHttpActionSchemaRequest'

const instantiateAction = <
  C extends HttpActionTarget & (new (...args: readonly any[]) => { exec(): any })
>(
  provider: Provider,
  action: C
): InstanceType<C> =>
  provider.with(
    {
      injectionInterceptor<D>(
        request: ServiceRequest,
        ctx: InjectionInterceptorContext<D>
      ): Resolved<D> {
        let result: any

        const match = maybeMatchHttpActionSchemaRequest(request, {
          body: req => {
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readBodySync<any>(req.body.schema)
          },

          exec: req => {
            result = req.exec.func
          },

          headers: req => {
            const schema = ObjectSchemaNode.of(req.headers.schema)
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readHeaders(schema)
          },

          namedHeaders: req => {
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readHeaders(req.headers.schema, req.headers.name)
          },

          namedParams: req => {
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readParams(req.params.schema, req.params.name)
          },

          namedQuery: req => {
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readQuery(req.query.schema, req.query.name)
          },

          params: req => {
            const schema = ObjectSchemaNode.of(req.params.schema)
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readParams(schema)
          },

          query: req => {
            const schema = ObjectSchemaNode.of(req.query.schema)
            const httpRequest = ctx.provider.getService(HttpRequest)
            result = httpRequest.readQuery(schema)
          },
        })

        return match[0] ? result : ctx.pass()
      },
    },
    interceptedProvider => interceptedProvider.instantiate(action, ...([] as any))
  )

export default instantiateAction
