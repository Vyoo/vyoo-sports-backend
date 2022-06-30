import type Provider from './Provider'
import type Resolved from './Resolved'

/**
 * Context object passed to injection interceptors during dependency resolution
 */
export default interface InjectionInterceptorContext<D> {
  readonly provider: Provider

  pass(): Resolved<D>
}
