import 'source-map-support'
import env from '^/env'
import ConfigPlugin from '&/config/plugin'
import createCoreApp from '&/core/createApp'
import HttpPlugin from '&/http/plugin'
import LoggingPlugin from '&/logging/plugin'
import isInServerlessOfflineContext from '&/serverless/isInServerlessOfflineContext'
import ServerlessPlugin from '&/serverless/plugin'
import SportsPlugin from './apps/SportsPlugin'
import AuthMiddleware from './auth/AuthMiddleware'

const createApp = () => {
  const app = createCoreApp()
    .use(LoggingPlugin)
    .use(ConfigPlugin, { env })
    .use(HttpPlugin)
    .use(ServerlessPlugin)
    .use(SportsPlugin)

  app.configureActions({
    serverless: { tracing: isInServerlessOfflineContext() ? undefined! : 'Active' },
  })

  app.configureFuncs(() => ({ tracing: isInServerlessOfflineContext() ? undefined! : 'Active' }))

  app.useActionMiddleware(AuthMiddleware)

  Object.assign(app.buildContext, env)

  // eslint-disable-next-line node/no-process-env
  app.buildContext.stage = process.env.STAGE

  const index1 = process.argv.indexOf('--stage')

  if (index1 > 0 && process.argv[index1 + 1]) {
    app.buildContext.stage = process.argv[index1 + 1]
  } else {
    const index2 = process.argv.indexOf('-s')

    if (index2 > 0 && process.argv[index2 + 1]) {
      app.buildContext.stage = process.argv[index2 + 1]
    }
  }

  return app
}

export default createApp
