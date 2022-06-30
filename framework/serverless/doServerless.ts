import type AppBuilder from '&/core/AppBuilder'
import HttpExtensions from '&/http/HttpExtensions'
import isHttpActionDecoratorCreator from '&/http/actions/decorators/isHttpActionDecoratorCreator'
import type ServerlessExtensions from './ServerlessExtensions'
import type ServerlessMethod from './ServerlessMethod'
import createServerlessHttpActionDecorator from './http/actions/createServerlessHttpActionDecorator'

const doServerless: ServerlessMethod = function Serverless(
  this: AppBuilder<ServerlessExtensions>,
  subject,
  ...args
) {
  if (isHttpActionDecoratorCreator(subject)) {
    return createServerlessHttpActionDecorator.apply(
      this as AppBuilder<HttpExtensions & ServerlessExtensions>,
      args
    )
  }

  throw new Error(`Unsupported subject: ${subject}`)
}

export default doServerless
