import type ServerlessHttpAction from './ServerlessHttpAction'
import type ServerlessHttpActionTarget from './ServerlessHttpActionTarget'

type ServerlessHttpActionDecorator = <Target extends ServerlessHttpActionTarget>(
  target: Target
) => ServerlessHttpAction<Target>

export default ServerlessHttpActionDecorator
