import type { PreTokenGenerationTriggerEvent } from 'aws-lambda'
import { sls } from '^/const'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import SoccerLeagueDsl from '$/soccer.lib/gremlin/SoccerLeagueDsl'
import CognitoIdentityTokenExtensions from '$/sports.lib/cognito/CognitoIdentityTokenExtensions'
import AuthDsl from '$/sports.lib/gremlin/AuthDsl'
import Graph from '$/sports.lib/gremlin/write'
import { ClaimName } from '~/enums'
import { Func } from '~/sports.app'

@Func({
  events: [
    {
      cognitoUserPool: {
        pool: `${sls.param.cognitoUserPoolName}`,
        existing: true,
        trigger: 'PreTokenGeneration',
      },
    },
  ],
})
export default class PreTokenGeneration {
  constructor(readonly log = inject(Log), readonly graph = inject(Graph)) {}

  async exec(event: PreTokenGenerationTriggerEvent): Promise<PreTokenGenerationTriggerEvent> {
    this.log.debug(`event:`, event)

    const claims = await this.getClaims(event)

    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: claims as CognitoIdentityTokenExtensions & { [name: string]: string },
    }

    this.log.debug(`event.response:`, event.response)

    return event
  }

  async getClaims(
    event: PreTokenGenerationTriggerEvent
  ): Promise<Partial<CognitoIdentityTokenExtensions>> {
    const res = await this.graph.first<{
      loginId: string
      userId: string
      soccerLeagueIds: string[]
    }>(({ g, __ }) =>
      g
        .use(AuthDsl)
        .upsertLogin(event.userName)
        .as('login')
        .project('loginId', 'userId', 'leagueIds')
        .by(__.id())
        .by(__.apply(AuthDsl.prototype.loginUser).id())
        .by(
          __.apply(AuthDsl.prototype.loginUser)
            .apply(SoccerLeagueDsl.prototype.userSoccerLeagues)
            .id()
            .fold()
        )
    )

    this.log.debug(`res:`, res)

    const claims: Partial<CognitoIdentityTokenExtensions> = {}

    if (res) {
      if (res.loginId) {
        claims[ClaimName.loginId] = res.loginId
      }

      if (res.userId) {
        claims[ClaimName.userId] = res.userId
      }

      if (res.soccerLeagueIds?.filter(Boolean)?.length) {
        claims[ClaimName.soccerLeagueId] = res.soccerLeagueIds.join(',')
      }
    }

    return claims
  }
}
