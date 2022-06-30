import inject from '&/di/inject'
import isInServerlessOfflineContext from '&/serverless/isInServerlessOfflineContext'
import Auth from '$/sports.lib/auth/Auth'
import User from '$/sports.lib/auth/User'
import { Role } from '$/sports.lib/enums'
import { Action } from '~/sports.app'

@Auth(Role.stranger)
@Action({
  serverless: {
    tracing: isInServerlessOfflineContext() ? undefined : 'Active',
  },
})
export default class AuthWhoamiGet {
  constructor(readonly user = inject(User)) {}

  exec = Action.exec(
    x =>
      x.object({
        roles: x.array(x.string()),
      }),
    async () => ({ roles: this.user.roles })
  )
}
