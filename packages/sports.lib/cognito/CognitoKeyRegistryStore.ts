import type CognitoPublicKey from './CognitoPublicKey'

export default class CognitoKeyRegistryStore {
  readonly keys: {
    [poolId: string]:
      | undefined
      | { [kid: string]: CognitoPublicKey }
      | Promise<{ [kid: string]: CognitoPublicKey }>
  } = {}
}
