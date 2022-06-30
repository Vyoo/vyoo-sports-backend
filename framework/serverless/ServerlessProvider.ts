import type { Context } from 'aws-lambda'
import type ServerlessContext from './ServerlessContext'
import type ServerlessEvent from './ServerlessEvent'

export default class ServerlessProvider {
  event?: ServerlessEvent

  context?: ServerlessContext

  handleHandlerStart(event: ServerlessEvent, context: Context): void {
    this.event = event
    this.context = context
  }
}
