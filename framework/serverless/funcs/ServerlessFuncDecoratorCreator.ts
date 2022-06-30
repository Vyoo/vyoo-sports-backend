import type ServerlessFuncConfigFn from './ServerlessFuncConfigFn'
import type ServerlessFuncDecorator from './ServerlessFuncDecorator'

export default interface ServerlessFuncDecoratorCreator {
  (config?: undefined | ServerlessFuncConfigFn): ServerlessFuncDecorator
}
