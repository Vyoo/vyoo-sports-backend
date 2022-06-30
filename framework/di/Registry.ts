import emptyArray from '&/utils/emptyArray'
import type Provider from './Provider'
import type Resolved from './Resolved'
import ServiceId from './ServiceId'
import type ServiceRequest from './ServiceRequest'

export type Decorator<T = unknown> = (params: { readonly instance: T }) => T

/**
 * Holds a collection of services registered with the container
 */
export default class Registry {
  constructor(
    readonly registrations: ReadonlyMap<
      unknown,
      {
        readonly scope: 'transient' | 'dependency' | 'request' | 'singleton'
        factory?(ctx: { readonly request: ServiceRequest<any>; readonly provider: Provider }): any
      }
    >,
    readonly decorators: ReadonlyMap<unknown, Decorator<any>[]>
  ) {}

  /**
   * Returns a registration matching the given service ID
   * @param {ServiceId<T>} id
   * @returns {{readonly scope: "transient" | "dependency" | "request" | "singleton", factory?(ctx: {readonly request: ServiceRequest<T>, readonly provider: Provider}): Resolved<T>} | undefined}
   */
  getRegistration<T>(id: ServiceId<T>):
    | undefined
    | {
        readonly scope: 'transient' | 'dependency' | 'request' | 'singleton'
        factory?(ctx: {
          readonly request: ServiceRequest<T>
          readonly provider: Provider
        }): Resolved<T>
      } {
    return this.registrations.get(id.value)
  }

  /**
   * Returns a list of decorators matching the given service ID
   * @param {ServiceId<T>} id
   * @returns {readonly Decorator<Resolved<T>>[]}
   */
  getDecorators<T>(id: ServiceId<T>): readonly Decorator<Resolved<T>>[] {
    return this.decorators.get(id.value) ?? emptyArray
  }
}
