import inject from '&/di/inject'
import SoccerLeagueDsl from '$/soccer.lib/gremlin/SoccerLeagueDsl'
import Auth from '$/sports.lib/auth/Auth'
import User from '$/sports.lib/auth/User'
import LocationDsl from '$/sports.lib/gremlin/LocationDsl'
import { Role } from '~/enums'
import Graph from '~/gremlin/write'
import { Action } from '~/soccer.app'

@Action()
// @Auth(Role.soccerUser)
@Auth(Role.stranger)
export default class SoccerCreateLeaguePost20220101 {
  constructor(
    readonly graph = inject(Graph),
    readonly user = inject(User),
    readonly body = Action.body(x =>
      x
        .object({
          name: x.string().title('League name'),
          location: x
            .object({
              lat: x.number().title('Map point latitude'),
              lng: x.number().title('Map point longitude'),
              address: x.string().title('Address as text'),
            })
            .title('League location'),
          // logo: x.object({}).title('Uploaded logo info'),
          vision: x.string().nullable().title('League vision'),
          mission: x.string().nullable().title('League mission'),
          about: x.string().nullable().title('About the league'),
        })
        .title('League data')
    )
  ) {}

  exec = Action.exec(
    x =>
      x.object({
        league: {
          id: x.string(),
          name: x.string(),
          vision: x.string().nullable(),
          mission: x.string().nullable(),
          about: x.string().nullable(),
          location: x.object({
            lat: x.number(),
            lng: x.number(),
            address: x.string().nullable(),
          }),
        },
      }),
    async () => {
      const result = await this.graph.first<{
        league: {
          id: string
          label: string
          name: string
          about: string
          vision: string
          mission: string
        }
        location: {
          id: string
          label: string
          lat: number
          lng: number
          address: string
        }
      }>(({ g }) =>
        g
          //
          .use(LocationDsl, SoccerLeagueDsl)
          .createSoccerLeague({
            login: { id: this.user.loginId },
            name: this.body.name,
            about: this.body.about,
            vision: this.body.vision,
            mission: this.body.mission,
            location: this.graph.fragment(({ g: s }) =>
              s.use(LocationDsl).createLocation({
                lat: this.body.location.lat,
                lng: this.body.location.lng,
                address: this.body.location.address,
              })
            ),
          })
      )

      // const result = await this.graph.use([LocationDsl, SoccerLeagueDsl], x => [
      //   x.createLocation({
      //     lat: this.body.location.lat,
      //     lng: this.body.location.lng,
      //     address: this.body.location.address,
      //   }),
      //   x.as('location'),
      //   x.createSoccerLeague({
      //     name: this.body.name,
      //     location: x.select('location'),
      //     about: this.body.about,
      //     vision: this.body.vision,
      //     mission: this.body.mission,
      //   }),
      //   x.first<{
      //     league: {
      //       id: string
      //       label: string
      //       name: string
      //       about: string
      //       vision: string
      //       mission: string
      //     }
      //     location: {
      //       id: string
      //       lat: number
      //       lng: number
      //       address: string
      //     }
      //   }>(),
      // ])

      return {
        league: {
          ...result!.league,
          location: result!.location,
        },
      }
    }
  )
}
