import type HttpActionBodySchemaRequest from './HttpActionBodySchemaRequest'
import type HttpActionHeadersSchemaRequest from './HttpActionHeadersSchemaRequest'
import type HttpActionNamedHeadersSchemaRequest from './HttpActionNamedHeadersSchemaRequest'
import type HttpActionNamedParamsSchemaRequest from './HttpActionNamedParamsSchemaRequest'
import type HttpActionNamedQuerySchemaRequest from './HttpActionNamedQuerySchemaRequest'
import type HttpActionParamsSchemaRequest from './HttpActionParamsSchemaRequest'
import type HttpActionQuerySchemaRequest from './HttpActionQuerySchemaRequest'

type HttpActionSchemaRequest =
  | HttpActionBodySchemaRequest
  | HttpActionHeadersSchemaRequest
  | HttpActionNamedHeadersSchemaRequest
  | HttpActionNamedParamsSchemaRequest
  | HttpActionNamedQuerySchemaRequest
  | HttpActionParamsSchemaRequest
  | HttpActionQuerySchemaRequest

export default HttpActionSchemaRequest
