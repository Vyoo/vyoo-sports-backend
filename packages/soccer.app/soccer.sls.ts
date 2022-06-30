import app from './soccer.app'

module.exports = app.configureServerless({
  service: 'vyoo-sports-backend-soccer',
  custom: {
    'serverless-offline': {
      httpPort: 3030,
      websocketPort: 3031,
      lambdaPort: 3032,
    },
  },
})
