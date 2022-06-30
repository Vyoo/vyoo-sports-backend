export default interface CognitoPublicKey {
  readonly alg: string
  readonly e: string
  readonly kid: string
  readonly kty: string
  readonly n: string
  readonly use: string
  readonly pem: string
}
