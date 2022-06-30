import type HttpActionDecoratorCreatorHelpers from './HttpActionDecoratorCreatorHelpers'
import buildHttpActionBody from './buildHttpActionBody'
import buildHttpActionExec from './buildHttpActionExec'
import buildHttpActionHeaders from './buildHttpActionHeaders'
import buildHttpActionParams from './buildHttpActionParams'
import buildHttpActionQuery from './buildHttpActionQuery'
import createHttpActionMiddlewareDecorator from './createHttpActionMiddlewareDecorator'

const helpers: HttpActionDecoratorCreatorHelpers = {
  'framework:http:action-decorator-creator': true,

  body: buildHttpActionBody,
  exec: buildHttpActionExec,
  headers: buildHttpActionHeaders,
  middleware: createHttpActionMiddlewareDecorator,
  params: buildHttpActionParams,
  query: buildHttpActionQuery,
}

const withHttpActionDecoratorHelpers = <U>(obj: U): U & HttpActionDecoratorCreatorHelpers =>
  Object.assign(obj, helpers)

export default withHttpActionDecoratorHelpers
