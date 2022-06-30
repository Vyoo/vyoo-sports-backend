import { Role } from '~/enums'

export default class User {
  username: null | string = null

  userId!: string

  loginId!: string

  readonly roles: readonly Role[] = [Role.stranger]
}
