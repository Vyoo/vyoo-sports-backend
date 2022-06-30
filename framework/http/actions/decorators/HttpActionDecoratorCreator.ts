import type HttpActionConfigFn from '~/actions/HttpActionConfigFn'
import type HttpActionDecorator from './HttpActionDecorator'
import type HttpActionDecoratorCreatorHelpers from './helpers/HttpActionDecoratorCreatorHelpers'

type HttpActionDecoratorCreator = HttpActionDecoratorCreatorHelpers & {
  (config?: undefined | HttpActionConfigFn): HttpActionDecorator
}

export default HttpActionDecoratorCreator
