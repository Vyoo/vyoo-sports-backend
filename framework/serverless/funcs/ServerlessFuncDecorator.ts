import type ServerlessFunc from './ServerlessFunc'
import type ServerlessFuncTarget from './ServerlessFuncTarget'

export default interface ServerlessFuncDecorator {
  <Target extends ServerlessFuncTarget>(target: Target): ServerlessFunc<Target>
}
