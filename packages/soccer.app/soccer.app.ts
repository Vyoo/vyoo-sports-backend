import createApp from '$/sports.lib/createApp'

const app = createApp() // .discover(__dirname)

export default app

export const { Action, Auth, Role } = app
