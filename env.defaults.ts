import { URLSearchParams } from 'url'

const defaults = {
  SLS_ORG: 'vyoosports',
  SLS_APP: 'vyoo-sports-backend',

  REST_API_NAME: 'VyooSportsRestApi-${sls:stage}',
  HTTP_API_NAME: 'VyooSportsHttpApi-${sls:stage}',
  WEBSOCKET_API_NAME: 'VyooSportsWebsocketApi-${sls:stage}',

  // COGNITO_USER_POOL_NAME: 'vyoo-sports-pool',
  // COGNITO_USER_POOL_DOMAIN: 'aq-vyoo2',

  GOOGLE_IDP_CUSTOM_PROVIDER_NAME: 'CustomGoogle',
  GOOGLE_IDP_AUTH_SCOPES: 'profile,email,openid,https://www.googleapis.com/auth/cloud-platform',
  GOOGLE_IDP_ATTRIBUTES_REQUEST_METHOD: 'GET',
  GOOGLE_IDP_ISSUER: 'https://accounts.google.com',
  GOOGLE_IDP_ATTRIBUTE_MAPPING: new URLSearchParams({
    username: 'sub',
    email: 'email',
    email_verified: 'email_verified',
    phone_number: 'phoneNumbers',
    name: 'name',
    given_name: 'given_name',
    family_name: 'family_name',
    gender: 'genders',
    birthdate: 'birthdays',
    picture: 'picture',
  }).toString(),

  // COGNITO_CLIENT_NAME: 'vyoo-sports-frontend',

  COGNITO_CLIENT_ALLOWED_FLOWS: 'code', // 'code,implicit,client_credentials'
  COGNITO_CLIENT_ALLOWED_SCOPES: 'phone,email,openid,profile', // 'phone,email,openid,profile,aws.cognito.signin.user.admin'
  COGNITO_CLIENT_ACCESS_TOKEN_VALIDITY: '5',
  COGNITO_CLIENT_ID_TOKEN_VALIDITY: '5',
  COGNITO_CLIENT_EXPLICIT_AUTH_FLOWS: '', // 'REFRESH_TOKEN,REFRESH_TOKEN_AUTH,CUSTOM_AUTH,USER_SRP_AUTH,ADMIN_NO_SRP_AUTH,ADMIN_USER_PASSWORD_AUTH'
  COGNITO_CLIENT_CALLBACK_URLS: [
    'http://localhost:3000/dev/playground',
    'http://localhost:3000/dev/auth/complete',
    'http://localhost:3000/dev/docs/',
    'vyoosports://',
    'vyoosports://auth/callback',
  ].join(','),

  API_GATEWAY_REST_API_ID_EXPORT_KEY: 'apiGatewayRestApiId',
  API_GATEWAY_REST_API_ID_EXPORT_NAME: 'VyooSportsApiGateway-restApiId-${sls:stage}',

  API_GATEWAY_ROOT_RESOURCE_ID_EXPORT_KEY: 'apiGatewayRootResourceId',
  API_GATEWAY_ROOT_RESOURCE_ID_EXPORT_NAME: 'VyooSportsApiGateway-rootResourceId-${sls:stage}',

  API_GATEWAY_RESOURCE_EXPORT_KEY_PREFIX: 'apiGatewayResource',
  API_GATEWAY_RESOURCE_EXPORT_NAME_PREFIX: 'VyooSportsApiGateway-resource-${sls:stage}-',

  API_GATEWAY_HTTP_API_ID_EXPORT_KEY: 'apiGatewayHttpApiId',
  API_GATEWAY_HTTP_API_ID_EXPORT_NAME: 'VyooSportsApiGateway-httpApiId-${sls:stage}',

  API_GATEWAY_WEBSOCKET_API_ID_EXPORT_KEY: 'apiGatewayWebsocketApiId',
  API_GATEWAY_WEBSOCKET_API_ID_EXPORT_NAME: 'VyooSportsApiGateway-websocketApiId-${sls:stage}',

  COGNITO_USER_POOL_NAME_EXPORT_KEY: 'cognitoUserPoolName',
  COGNITO_USER_POOL_NAME_EXPORT_NAME: 'VyooSportsCognitoUserPool-name-${sls:stage}',
}

export default defaults
