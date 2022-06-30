import type { ClaimName } from '~/enums'

type CognitoIdentityTokenExtensions = {
  [K in ClaimName]: string
}

export default CognitoIdentityTokenExtensions
