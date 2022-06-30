import type HttpActionBodyBuilder from './HttpActionBodyBuilder'
import type HttpActionExecBuilder from './HttpActionExecBuilder'
import type HttpActionHeadersBuilder from './HttpActionHeadersBuilder'
import type HttpActionMiddlewareDecoratorCreator from './HttpActionMiddlewareDecoratorCreator'
import type HttpActionParamsBuilder from './HttpActionParamsBuilder'
import type HttpActionQueryBuilder from './HttpActionQueryBuilder'

export default interface HttpActionDecoratorCreatorHelpers {
  readonly ['framework:http:action-decorator-creator']: true

  readonly body: HttpActionBodyBuilder
  readonly exec: HttpActionExecBuilder
  readonly headers: HttpActionHeadersBuilder
  readonly middleware: HttpActionMiddlewareDecoratorCreator
  readonly params: HttpActionParamsBuilder
  readonly query: HttpActionQueryBuilder
}
