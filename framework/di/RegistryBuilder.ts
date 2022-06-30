import type Provider from './Provider'
import Registry from './Registry'
import type { Decorator } from './Registry'
import ServiceId from './ServiceId'
import type ServiceRequest from './ServiceRequest'

/**
 * Collects service implementation registrations and creates a registry object out of them
 */
export default class RegistryBuilder extends Registry {
  declare readonly registrations: Map<
    unknown,
    {
      readonly scope: 'transient' | 'dependency' | 'request' | 'singleton'
      factory?(ctx: { readonly request: ServiceRequest<any>; readonly provider: Provider }): any
    }
  >

  declare readonly decorators: Map<unknown, Decorator<any>[]>

  constructor() {
    super(new Map(), new Map())
  }

  /**
   * Builds a registry object from collected registrations
   * @returns {Registry}
   */
  build(): Registry {
    return this
  }

  /**
   * Adds new service implementation registration to this builder
   * @param {Id} id
   * @param {{scope?: "transient" | "dependency" | "request" | "singleton", factory?(ctx: {readonly request: ServiceRequest<Id>, readonly provider: Provider}): T} | {value: T}} config
   */
  registerService<
    T,
    Id extends T | (new (...args: readonly any[]) => T) = T | (new (...args: readonly any[]) => T)
  >(
    id: Id,
    config?:
      | {
          scope?: 'transient' | 'dependency' | 'request' | 'singleton'
          factory?(ctx: { readonly request: ServiceRequest<Id>; readonly provider: Provider }): T
        }
      | {
          value: T
        }
  ): void {
    this.addRegistration<T, Id>(
      ServiceId.of(id),
      config && 'value' in config
        ? {
            scope: 'singleton',
            factory: () => config.value,
          }
        : {
            ...config,
            scope: config?.scope ?? 'transient',
            factory: config?.factory ?? (({ provider }) => provider.instantiate<any>(id)),
          }
    )
  }

  /**
   * Adds new service decorator registration to this builder
   * @param {Id} id
   * @param {(params: {readonly instance: T}) => T} decorator
   */
  decorateService<
    T,
    Id extends T | (new (...args: readonly any[]) => T) = T | (new (...args: readonly any[]) => T)
  >(id: Id, decorator: (params: { readonly instance: T }) => T): void {
    this.addDecorator<T, Id>(ServiceId.of(id), decorator)
  }

  /**
   * Internal method that adds new service implementation registration to this builder
   * @param {ServiceId<Id>} id
   * @param {{readonly scope: "transient" | "dependency" | "request" | "singleton", factory?(ctx: {readonly request: ServiceRequest<Id>, readonly provider: Provider}): T}} config
   */
  addRegistration<T, Id extends T | (new (...args: readonly unknown[]) => T)>(
    id: ServiceId<Id>,
    config: {
      readonly scope: 'transient' | 'dependency' | 'request' | 'singleton'
      factory?(ctx: { readonly request: ServiceRequest<Id>; readonly provider: Provider }): T
    }
  ): void {
    this.registrations.set(id.value, config)
  }

  /**
   * Internal method that adds new service decorator registration to this builder
   * @param {ServiceId<Id>} id
   * @param {Decorator<T>} decorator
   */
  addDecorator<T, Id extends T | (new (...args: readonly unknown[]) => T)>(
    id: ServiceId<Id>,
    decorator: Decorator<T>
  ): void {
    const decorators = this.decorators.get(id.value)

    if (decorators) {
      decorators.push(decorator)
    } else {
      this.decorators.set(id.value, [decorator])
    }
  }
}
