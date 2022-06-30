type Routes = {
  readonly ver: string
  readonly routes: (readonly [string, string, string, string, null | string])[]
  readonly subs: {
    readonly sub: string
    readonly routes: (readonly [string, string, string, string, null | string])[]
  }[]
}[]

export default Routes
