import AuthDsl from '$/sports.lib/gremlin/AuthDsl'
import LocationDsl from '$/sports.lib/gremlin/LocationDsl'
import escapeEs from '$/utils/escapeEs'
import Dsl from './Dsl'
import type Fragment from './Fragment'

export default class SoccerLeagueDsl extends Dsl {
  // protected readonly g = this.use(UserDsl, LocationDsl)

  soccerLeague(id: string): this {
    return this.V(id).hasLabel('SoccerLeague')
  }

  soccerLeagues(params: { limit: number; search?: undefined | string }): this {
    let g = this.V().hasLabel('SoccerLeague')

    if (params.search) {
      // const { TextP } = this
      //
      // g = g.has('name', TextP.containing(params.search))

      const term = params.search
        .split(/\s+/)
        .filter(Boolean)
        .map(x => `${escapeEs(x)}~`)
        .join(' ')

      g = g.has('name', `Neptune#fts ${term}`)
    }

    return g.limit(params.limit)
  }

  userSoccerLeagues(): this {
    return this.out('SOCCER_LEAGUE')
  }

  soccerLeagueLocations(): this {
    return this.out('LOCATION')
  }

  // readonly soccerLeague = this.step(
  //   (id: string) => g => g.V(id).has('SoccerLeague', 'graph', this.ctx.graphName)
  // )

  // createSoccerLeague(params: {
  //   readonly name: string
  //   readonly location: { readonly id: string }
  //   readonly vision: null | string
  //   readonly mission: null | string
  //   readonly about: null | string
  // }): this {
  //
  //   return this.g
  //     .soccerLeague('')
  //     .location('asd')
  //     .login('')
  //     .location('')
  //     .login('')
  //     .as('location')
  //     .location('')
  //     .as('a')
  //     .addV('SoccerLeague')
  //     .property('graph', this.ctx.graphName)
  //     .property('name', params.name)
  //     .property('about', params.about)
  //     .property('vision', params.vision)
  //     .property('mission', params.mission)
  //     // .sideEffect(
  //     //   this.__
  //     //     .as('league')
  //     //     .addE('LOCATION')
  //     //     .from_('league')
  //     //     .to('location')
  //     //     .addE('SOCCER_LEAGUE')
  //     //     .from_('location')
  //     //     .to('league')
  //     // )
  // }

  // readonly createSoccerLeague = this.step2(
  //   [UserDsl, LocationDsl],
  //     (params: {
  //       readonly name: string
  //       readonly location: { readonly id: string }
  //       readonly vision: string
  //     }) =>
  //       this.soccerLeague().login('').login('').location('').soccerLeague('').property('name', params.name)
  // )

  createSoccerLeague(params: {
    readonly login: { readonly id: string } | Fragment
    readonly name: string
    readonly location: { readonly id: string } | Fragment
    readonly about: null | string
    readonly vision: null | string
    readonly mission: null | string
  }): this {
    const { __, WithOptions } = this

    const { login, location } = params

    const loginFragment = this.isFragment(login)
      ? login
      : this.fragment(g => g.apply(AuthDsl.prototype.login, login.id))

    const locationFragment = this.isFragment(location)
      ? location
      : this.fragment(g => g.apply(LocationDsl.prototype.location, location.id))

    return (
      this
        // Login :login
        .embed(loginFragment)
        .fold()
        .coalesce(__.unfold(), __.fail('Login does not exist'))
        .as('login')
        //
        // User :user
        .apply(AuthDsl.prototype.loginUser)
        .fold()
        .coalesce(__.unfold(), __.fail('User does not exist'))
        .as('user')
        //
        // Location :location
        .embed(locationFragment)
        .fold()
        .coalesce(__.unfold(), __.fail('Location does not exist'))
        .as('location')
        //
        // SoccerLeague :league
        .addV('SoccerLeague')
        .as('league')
        .property('name', params.name)
        .property('about', params.about)
        .property('vision', params.vision)
        .property('mission', params.mission)
        .sideEffect(
          __
            //
            // SoccerLeague :league -[CREATOR_USER]-> User :user
            .addE('CREATOR_USER')
            .from_('league')
            .to('user')
            //
            // User :user -[SOCCER_LEAGUE]-> SoccerLeague :league
            .addE('SOCCER_LEAGUE')
            .from_('user')
            .to('league')
            //
            // SoccerLogin :login -[CREATOR_LOGIN]-> Login :login
            .addE('CREATOR_LOGIN')
            .from_('league')
            .to('login')
            //
            // Login :login -[CREATOR_LOGIN]-> SoccerLogin :login
            .addE('SOCCER_LEAGUE')
            .from_('login')
            .to('league')
            //
            // SoccerLeague :league -[LOCATION]-> Location :location
            .addE('LOCATION')
            .from_('league')
            .to('location')
            //
            // Location :location -[SOCCER_LEAGUE]-> SoccerLeague :league
            .addE('SOCCER_LEAGUE')
            .from_('location')
            .to('league')
        )
        //
        // output
        .project('league', 'location')
        .by(__.select('league').valueMap().with_(WithOptions.tokens).by(__.unfold()))
        .by(__.select('location').valueMap().with_(WithOptions.tokens).by(__.unfold()))
    )
  }
}
