import type HttpActionDecoratorCreator from '&/http/actions/decorators/HttpActionDecoratorCreator'
import type ServerlessHttpAction from './http/actions/ServerlessHttpAction'
import type ServerlessHttpActionConfigFn from './http/actions/ServerlessHttpActionConfigFn'
import type ServerlessHttpActionTarget from './http/actions/ServerlessHttpActionTarget'

export default interface ServerlessMethod {
  (subject: HttpActionDecoratorCreator, config?: undefined | ServerlessHttpActionConfigFn): {
    <Target extends ServerlessHttpActionTarget>(target: Target): ServerlessHttpAction<Target>
  }
}
