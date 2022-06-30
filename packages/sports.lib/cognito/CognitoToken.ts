export default interface CognitoToken {
  token_use: string
  auth_time: number
  iss: string
  exp: number
  ist: number
  // username: string
  // client_id: string

  [key: string]: any
}
