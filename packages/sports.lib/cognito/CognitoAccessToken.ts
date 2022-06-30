import type CognitoToken from './CognitoToken'

export default interface CognitoAccessToken extends CognitoToken {
  token_use: 'access'

  version: number
  scope: string
  client_id: string
  username: string
  'cognito:groups': string[]
}
