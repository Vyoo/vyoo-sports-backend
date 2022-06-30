import createApp from '$/sports.lib/createApp'
import SportsAppPlugin from './SportsAppPlugin'

const sportsApp = createApp().use(SportsAppPlugin) // .discover(__dirname)

export default sportsApp

export const { Action, Func } = sportsApp
