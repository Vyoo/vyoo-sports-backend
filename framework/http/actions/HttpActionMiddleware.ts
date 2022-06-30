import type HttpActionMiddlewareContext from './HttpActionMiddlewareContext'

export default interface HttpActionMiddleware<
  C extends new () => { exec(...args: readonly unknown[]): unknown } = new () => {
    exec(...args: readonly unknown[]): unknown
  }
> {
  exec(context: HttpActionMiddlewareContext<C>): Promise<void>
}
