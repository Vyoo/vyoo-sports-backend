import app from './sports.app'

module.exports = app.configureServerless({
  service: 'vyoo-sports-backend-sports',
  custom: {
    'serverless-offline': {
      httpPort: 3020,
      websocketPort: 3021,
      lambdaPort: 3022,
    },
  },
})
