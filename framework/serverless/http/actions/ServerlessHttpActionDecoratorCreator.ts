import type ServerlessHttpActionConfigFn from './ServerlessHttpActionConfigFn'
import type ServerlessHttpActionDecorator from './ServerlessHttpActionDecorator'

type ServerlessHttpActionDecoratorCreator = (
  config?: undefined | ServerlessHttpActionConfigFn
) => ServerlessHttpActionDecorator

export default ServerlessHttpActionDecoratorCreator
