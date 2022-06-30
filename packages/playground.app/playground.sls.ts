import app from './playground.app'

module.exports = app.configureServerless({
  service: 'vyoo-sports-backend-playground',
  custom: {
    'serverless-offline': {
      httpPort: 3010,
      websocketPort: 3011,
      lambdaPort: 3012,
    },
  },
})
