import Log from '&/logging/Log'
import Container from './Container'
import type InjectionInterceptorContext from './InjectionInterceptorContext'
import Injector from './Injector'
import type Registry from './Registry'
import type Resolved from './Resolved'
import Scope from './Scope'
import ScopeFactory from './ScopeFactory'
import ServiceId from './ServiceId'
import type ServiceRequest from './ServiceRequest'
import providerSymbol from './providerSymbol'

/**
 * Dependency provider class responsible for resolving service requests
 */
export default class Provider {
  /**
   * Checks if the provided object is a valid provider instance
   * @param obj
   * @returns {obj is Provider}
   */
  static isInstance(obj: any): obj is Provider {
    return obj !== null && typeof obj === 'object' && obj[providerSymbol] === true
  }

  /**
   * Utility method checking if the provided object is a class constructor
   * @param obj
   * @returns {obj is {new(...args: unknown[]): unknown}}
   */
  static isConstructor(obj: any): obj is new (...args: readonly unknown[]) => unknown {
    return (
      obj.prototype &&
      obj.constructor &&
      typeof obj.constructor === 'function' &&
      obj.constructor.prototype
    )
  }

  readonly [providerSymbol] = true

  readonly log: Log

  /**
   * Returns dependency injection container owning this provider
   * @returns {Container}
   */
  get container(): Container {
    return this.scope.container
  }

  /**
   * Returns the registry of the dependency injection container
   * @returns {Registry}
   */
  get registry(): Registry {
    return this.scope.registry
  }

  constructor(readonly scope: Scope) {
    this.log = new Log(`Provider`, [...this.scope.log.path, `Provider`])
  }

  /**
   * Generic utility method that manipulates this provider
   * @param {{injectionInterceptor?<D>(request: ServiceRequest, context: InjectionInterceptorContext<D>): Resolved<D>}} params
   *  injectionInterceptor - function that will be called before normal dependency resolution flow that allows caller to customize the resolution
   * @param {(provider: Provider) => R} action function to execute with the altered provider
   * @returns {R}
   * @template R
   */
  with<R>(
    params: {
      injectionInterceptor?<D>(
        request: ServiceRequest,
        context: InjectionInterceptorContext<D>
      ): Resolved<D>
    },
    action: (provider: Provider) => R
  ): R {
    if (params.injectionInterceptor) {
      this.injectionInterceptorChain.unshift(params.injectionInterceptor)
    }

    try {
      return action(this)
    } finally {
      if (params.injectionInterceptor) {
        this.injectionInterceptorChain.shift()
      }
    }
  }

  // instantiate<C extends new () => unknown>(klass: C): InstanceType<C>

  /**
   * Creates new instance of the specified class resolving its declared dependencies
   * Does not create a new resolution scope for created instance as the instance itself is not considered a dependency
   * @param {C} klass
   * @param {any[]} args
   * @returns {InstanceType<C>}
   * @template C
   */
  instantiate<C extends new (...args: readonly any[]) => unknown>(
    klass: C,
    ...args: ConstructorParameters<C>
  ): InstanceType<C> {
    this.log.debug(`instantiating ${klass.name}`)

    return Injector.withProvider(this, () => new klass(...args) as InstanceType<C>)
  }

  // getService<A extends readonly any[], C extends new (...args: A) => unknown>(
  //   klass: C,
  //   args: A
  // ): InstanceType<C>

  /**
   * Resolves the service by ID in a form of a class
   * Returns "default" implementation if no implementation was registered on the container for that ID
   * @param {T} klass requested service ID in a form of a class
   * @param {ConstructorParameters<T>} args
   * @returns {InstanceType<T>}
   */
  getService<T extends abstract new (...args: readonly any[]) => unknown>(
    klass: T,
    args?: ConstructorParameters<T>
  ): InstanceType<T>

  /**
   * Resolves the service by ID
   * Returns "default" implementation if no implementation was registered on the container for that ID
   * @param {T} id
   * @returns {Resolved<T>}
   */
  getService<T>(id: T): Resolved<T> {
    // eslint-disable-next-line prefer-rest-params
    return this.getServiceCore({ mode: 'default', id: ServiceId.of(id), args: arguments[1] })
  }

  /**
   * Resolves the service by ID in a form of a class
   * Throws an error if no implementation was registered on the container for that ID
   * @param {T} klass
   * @param {ConstructorParameters<T>} args
   * @returns {InstanceType<T>}
   */
  getRequiredService<T extends abstract new (...args: readonly any[]) => unknown>(
    klass: T,
    args?: ConstructorParameters<T>
  ): InstanceType<T>

  /**
   * Resolves the service by ID
   * Throws an error if no implementation was registered on the container for that ID
   * @param {T} id
   * @returns {Resolved<T>}
   */
  getRequiredService<T>(id: T): Resolved<T> {
    // eslint-disable-next-line prefer-rest-params
    return this.getServiceCore({ mode: 'required', id: ServiceId.of(id), args: arguments[1] })
  }

  /**
   * Resolves the service by ID in a form of a class
   * Returns undefined if no implementation was registered on the container for that ID
   * @param {T} klass
   * @param {ConstructorParameters<T>} args
   * @returns {InstanceType<T> | undefined}
   */
  getOptionalService<T extends abstract new (...args: readonly any[]) => unknown>(
    klass: T,
    args?: ConstructorParameters<T>
  ): undefined | InstanceType<T>

  /**
   * Resolves the service by ID
   * Returns undefined if no implementation was registered on the container for that ID
   * @param {T} id
   * @returns {Resolved<T> | undefined}
   */
  getOptionalService<T>(id: T): undefined | Resolved<T> {
    // eslint-disable-next-line prefer-rest-params
    return this.getServiceCore({ mode: 'optional', id: ServiceId.of(id), args: arguments[1] })
  }

  /**
   * Resolves the service by a provided request object
   * @param {ServiceRequest} request
   * @returns {any}
   */
  getServiceCore(request: ServiceRequest): any {
    this.log.debug(`getting ${request.id}`)

    const injectionInterceptorChainIterator = [...this.injectionInterceptorChain][Symbol.iterator]()

    const continueResolution = () => {
      const res = injectionInterceptorChainIterator.next()

      // eslint-disable-next-line no-use-before-define
      return res.done ? this.resolveService(request) : res.value(request, context)

      // if (res.done) {
      //   const result = this.resolveService(request)
      //   console.log(`[DependencyProvider] getServiceCore() `, request, `~>`, result)
      //   return result
      // }
      //
      // // eslint-disable-next-line no-use-before-define
      // return res.value(request, context)
    }

    const context: InjectionInterceptorContext<unknown> = {
      provider: this,
      pass: continueResolution,
    }

    return continueResolution()
  }

  /**
   * Internal method that resolves the service request without calling any interceptors
   * @param {ServiceRequest} request
   * @returns {any}
   */
  resolveService(request: ServiceRequest): any {
    this.log.debug(`resolving ${request.id}`)

    let transient: boolean
    let scope: Scope
    let factory: (ctx: { readonly request: ServiceRequest; readonly provider: Provider }) => any
    const registration = this.registry.getRegistration(request.id)

    if (registration) {
      this.log.debug(`found registration for ${request.id}`, registration)

      if (registration.scope !== 'transient') {
        transient = false
        const matchingScope = this.scope.findScope(registration.scope)

        if (!matchingScope) {
          this.log.debug(`no scope matching ${registration.scope} found for ${request.id}`)

          if (request.mode !== 'optional') {
            throw new Error(`No scope "${registration.scope}" to store ${request.id}`)
          }

          this.log.debug(`resolved ${request.id} as undefined`)
          return undefined
        }

        scope = matchingScope
      } else {
        transient = true
        scope = new Scope(this.scope, ['dependency'], `${request.id}`)
      }

      if (registration.factory) {
        factory = registration.factory
      } else {
        factory = ({ request: req }) => scope.provider.resolveServiceCore(req)
      }
    } else {
      this.log.debug(`no registration found for ${request.id}`)

      if (request.mode === 'required') {
        throw new Error(`Service ${request.id} not registered`)
      }

      if (request.mode === 'optional') {
        this.log.debug(`resolved ${request.id} as undefined`)
        return undefined
      }

      transient = true
      scope = new Scope(this.scope, ['dependency'], `${request.id}`)
      factory = ({ request: req }) => scope.provider.resolveServiceCore(req)
    }

    this.log.debug(`${request.id} is ${transient ? `transient` : `not transient`}`)

    if (!transient) {
      const existing = scope.maybeGetInstance(request.id)

      if (existing !== undefined) {
        this.log.debug(`found existing instance for ${request.id} in ${scope}`)

        this.log.debug(`resolved ${request.id} as`, typeof existing)
        return existing
      }
    }

    const service = factory({ request, provider: scope.provider })

    if (service === undefined) {
      this.log.debug(`service ${request.id} factory returned undefined`)

      if (request.mode !== 'optional') {
        throw new Error(`Service ${request.id} not available`)
      }

      this.log.debug(`resolved ${request.id} as undefined`)
      return undefined
    }

    this.log.debug(`created new instance for ${request.id}:`, service)

    if (!transient) {
      scope.registerInstance(request.id, service)
      this.log.debug(`registered created instance for ${request.id} in ${scope.tags}`)
    }

    this.log.debug(`resolved ${request.id} as`, typeof service)
    return service
  }

  protected resolveServiceCore({ id, args }: ServiceRequest): any {
    this.log.debug(`core resolution of ${id}`)

    let result: any

    if (id.equals(ServiceId.of(Provider))) {
      result = this
    } else if (id.equals(ServiceId.of(Scope)) || id.equals(ServiceId.of(ScopeFactory))) {
      result = this.scope
    } else if (id.equals(ServiceId.of(Container))) {
      result = this.container
    } else if (typeof id.value === 'function') {
      // if (isFunctionWithDependencies(request)) {
      //   return request(
      //     Array.isArray(request.$$dependencies)
      //       ? request.$$dependencies.map(this._getService)
      //       : Object.fromEntries(
      //           Object.entries(request.$$dependencies).map(([key, value]) => [
      //             key,
      //             this._getService(value),
      //           ])
      //         )
      //   )
      // }

      if (Provider.isConstructor(id.value)) {
        // console.log(`[DependencyContainer]   ::keys:`, Object.keys(instance))

        result =
          args === undefined
            ? this.instantiate(id.value)
            : this.instantiate(id.value, ...(args as ConstructorParameters<typeof id.value>))
      } else {
        result = id.value
      }
    } else {
      result = id.value
    }

    const decorators = this.registry.getDecorators(id)
    return decorators.reduce((instance, decorator) => decorator({ instance }), result)
  }

  protected readonly injectionInterceptorChain: (<D>(
    request: ServiceRequest,
    context: InjectionInterceptorContext<D>
  ) => Resolved<D>)[] = []
}
