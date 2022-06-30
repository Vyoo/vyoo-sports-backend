import type CognitoIdentityTokenExtensions from './CognitoIdentityTokenExtensions'
import type CognitoToken from './CognitoToken'

export default interface CognitoIdentityToken
  extends CognitoToken,
    Partial<CognitoIdentityTokenExtensions> {
  token_use: 'id'

  email: string
  'cognito:groups': string[]
  'cognito:username': string
  identities: {
    userId: string
    providerName: string
    providerType: string
    primary: boolean

    [key: string]: any
  }[]
}
