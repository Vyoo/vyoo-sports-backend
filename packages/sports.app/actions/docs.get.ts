import inject from '&/di/inject'
import HttpRequest from '&/http/HttpRequest'
import HttpResponse from '&/http/HttpResponse'
import Auth from '$/sports.lib/auth/Auth'
import CognitoService from '$/sports.lib/cognito/CognitoService'
import { Role } from '$/sports.lib/enums'
import serveDocs from '~/serveDocs'
import { Action } from '~/sports.app'

@Action()
@Auth(Role.stranger)
export default class DocsGet {
  constructor(
    readonly request = inject(HttpRequest),
    readonly response = inject(HttpResponse),
    readonly cognitoService = inject(CognitoService),
    readonly accept = Action.headers('accept', x => x.string().optional()),
    readonly versionFromQuery = Action.query('urls.primaryName', x => x.string().optional())
  ) {}

  exec() {
    return serveDocs(this)
  }
}
