import type HttpModel from '~/HttpModel'
import type HttpAction from '~/actions/HttpAction'
import type HttpActionConfigFn from '~/actions/HttpActionConfigFn'
import type HttpActionDecorator from './HttpActionDecorator'
import type HttpActionTarget from './HttpActionTarget'

const createHttpActionDecorator = function HttpActionCreator(
  this: {
    readonly http: {
      readonly model: HttpModel
    }
  },
  config?: undefined | HttpActionConfigFn
): HttpActionDecorator {
  return <Target extends HttpActionTarget>(target: Target): HttpAction<Target> => {
    this.http.model.registerAction(target, config)
    return target
  }
}

export default createHttpActionDecorator
