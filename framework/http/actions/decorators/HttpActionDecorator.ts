import type HttpAction from '~/actions/HttpAction'
import type HttpActionTarget from './HttpActionTarget'

export default interface HttpActionDecorator {
  <Target extends HttpActionTarget>(target: Target): HttpAction<Target>
}
