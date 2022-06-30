import inject from '&/di/inject'
import SoccerLeagueDsl from '$/soccer.lib/gremlin/SoccerLeagueDsl'
import Graph from '$/soccer.lib/gremlin/read'
import { Action, Auth, Role } from '~/soccer.app'

@Action()
@Auth(Role.stranger)
export default class SoccerListLeaguesGet20220101 {
  constructor(
    readonly graph = inject(Graph),
    readonly search = Action.query('search', x => x.string().optional())
  ) {}

  exec = Action.exec(
    x =>
      x.object({
        leagues: x.array(
          x.object({
            id: x.string(),
            name: x.string(),
            location: x.object({
              lat: x.number(),
              lng: x.number(),
              address: x.string().nullable(),
            }),
          })
        ),
      }),
    async () => {
      const res = await this.graph.list<{
        id: string
        name: string
        location: {
          id: string
          lat: number
          lng: number
          address: null | string
        }
      }>(({ g, __ }) =>
        g
          .withFullTextSearch()
          .use(SoccerLeagueDsl)
          .soccerLeagues({
            limit: 20,
            search: this.search,
          })
          .project('id', 'name', 'location')
          .by(__.id())
          .by(__.values('name'))
          .by(
            __.use(SoccerLeagueDsl)
              .soccerLeagueLocations()
              .project('id', 'lat', 'lng', 'address')
              .by(__.id())
              .by(__.values('lat'))
              .by(__.values('lng'))
              .by(__.values('address'))
          )
      )

      return {
        leagues: res,
      }
    }
  )
}
