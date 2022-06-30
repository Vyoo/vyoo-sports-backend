import Dsl from './Dsl'

export default class AuthDsl extends Dsl {
  // protected readonly g = this.use()

  login(id: string): this {
    return this.V(id).hasLabel('Login')
  }

  upsertLogin(userName: string): this {
    const { __ } = this

    return (
      this.V()
        //
        // Login :login
        .has('Login', 'userName', userName)
        .fold()
        .coalesce(__.unfold(), __.addV('Login').property('userName', userName))
        .store('loginSet')
        //
        // User :user
        .out('USER')
        .fold()
        .coalesce(
          __.unfold(),
          __.select('loginSet')
            .unfold()
            .as('login')
            .addV('User')
            .as('user')
            // User :user -[LOGIN]-> Login :login
            .addE('LOGIN')
            .from_('user')
            .to('login')
            // Login :login -[USER]-> User :user
            .addE('USER')
            .from_('login')
            .to('user')
        )
        //
        // output
        .select('loginSet')
        .unfold()
    )
  }

  user(id: string): this {
    return this.V(id).hasLabel('User')
  }

  loginUser(): this {
    return this.out('USER')
  }
}
