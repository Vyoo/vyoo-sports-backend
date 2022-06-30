import type ServiceRequest from '&/di/ServiceRequest'
import hasProperties from '&/utils/hasProperties'
import httpActionSchemaSymbol from '~/actions/httpActionSchemaSymbol'
import type HttpActionBodySchemaRequest from './HttpActionBodySchemaRequest'
import type HttpActionExecSchemaRequest from './HttpActionExecSchemaRequest'
import type HttpActionHeadersSchemaRequest from './HttpActionHeadersSchemaRequest'
import type HttpActionNamedHeadersSchemaRequest from './HttpActionNamedHeadersSchemaRequest'
import type HttpActionNamedParamsSchemaRequest from './HttpActionNamedParamsSchemaRequest'
import type HttpActionNamedQuerySchemaRequest from './HttpActionNamedQuerySchemaRequest'
import type HttpActionParamsSchemaRequest from './HttpActionParamsSchemaRequest'
import type HttpActionQuerySchemaRequest from './HttpActionQuerySchemaRequest'

const maybeMatchHttpActionSchemaRequest = (
  request: ServiceRequest,
  fns: {
    body?(arg: HttpActionBodySchemaRequest[typeof httpActionSchemaSymbol]): void
    exec?(arg: HttpActionExecSchemaRequest[typeof httpActionSchemaSymbol]): void
    headers?(arg: HttpActionHeadersSchemaRequest[typeof httpActionSchemaSymbol]): void
    namedHeaders?(arg: HttpActionNamedHeadersSchemaRequest[typeof httpActionSchemaSymbol]): void
    namedParams?(arg: HttpActionNamedParamsSchemaRequest[typeof httpActionSchemaSymbol]): void
    namedQuery?(arg: HttpActionNamedQuerySchemaRequest[typeof httpActionSchemaSymbol]): void
    params?(arg: HttpActionParamsSchemaRequest[typeof httpActionSchemaSymbol]): void
    query?(arg: HttpActionQuerySchemaRequest[typeof httpActionSchemaSymbol]): void
    default?(req: ServiceRequest): void
  }
): [boolean, boolean] => {
  const { id } = request

  if (hasProperties(id.value)) {
    const arg = id.value[httpActionSchemaSymbol]

    if (hasProperties(arg)) {
      const { body, headers, exec, params, query } = arg

      if (hasProperties(body)) {
        if (fns.body) {
          fns.body(arg as any)
          return [true, true]
        }
        return [true, false]
      }

      if (hasProperties(exec)) {
        if (fns.exec) {
          fns.exec(arg as any)
          return [true, true]
        }
        return [true, false]
      }

      if (hasProperties(headers)) {
        if (typeof headers.name === 'string') {
          if (fns.namedHeaders) {
            fns.namedHeaders(arg as any)
            return [true, true]
          }
        } else if (fns.headers) {
          fns.headers(arg as any)
          return [true, true]
        }
        return [true, false]
      }

      if (hasProperties(params)) {
        if (typeof params.name === 'string') {
          if (fns.namedParams) {
            fns.namedParams(arg as any)
            return [true, true]
          }
        } else if (fns.params) {
          fns.params(arg as any)
          return [true, true]
        }
        return [true, false]
      }

      if (hasProperties(query)) {
        if (typeof query.name === 'string') {
          if (fns.namedQuery) {
            fns.namedQuery(arg as any)
            return [true, true]
          }
        } else if (fns.query) {
          fns.query(arg as any)
          return [true, true]
        }
        return [true, false]
      }
    }
  }

  if (fns.default) {
    fns.default(request)
    return [false, true]
  }

  return [false, false]
}

export default maybeMatchHttpActionSchemaRequest
