import HttpActionMiddleware from './HttpActionMiddleware'

type HttpActionMiddlewareClass<
  C extends new () => { exec(...args: readonly unknown[]): unknown } = new () => {
    exec(...args: readonly unknown[]): unknown
  }
> = new (...args: readonly any[]) => HttpActionMiddleware<C>

export default HttpActionMiddlewareClass
