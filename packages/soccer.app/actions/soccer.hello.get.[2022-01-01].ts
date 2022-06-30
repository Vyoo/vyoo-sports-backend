import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import Auth from '$/sports.lib/auth/Auth'
import { Role } from '$/sports.lib/enums'
import { Action } from '~/soccer.app'

@Action()
@Auth(Role.stranger)
export default class SoccerHelloGet {
  constructor(readonly request = inject(HttpRequest)) {}

  readonly exec = Action.exec(
    x => x.object({ message: x.string() }),
    () => ({ message: `Hello from Soccer! remoteAddr: ${this.request.remoteAddr}` })
  )
}
