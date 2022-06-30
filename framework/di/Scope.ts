import Log from '&/logging/Log'
import type Container from './Container'
import Provider from './Provider'
import type Registry from './Registry'
import type Resolved from './Resolved'
import type ScopeFactory from './ScopeFactory'
import ServiceId from './ServiceId'
import scopeSymbol from './scopeSymbol'

let nextId = 1

/**
 * Resolution scope implementation
 */
export default class Scope implements ScopeFactory {
  /**
   * Checks if the provided object is a valid scope instance
   * @param obj
   * @returns {obj is Scope}
   */
  static isInstance(obj: any): obj is Scope {
    return obj !== null && typeof obj === 'object' && obj[scopeSymbol] === true
  }

  readonly [scopeSymbol] = true

  /**
   * Unique scope ID
   * @type {number}
   */
  readonly id = nextId++

  /**
   * Reference to a parent scope owning this scope
   * Equals to this when this scope is a container itself
   * @type {Scope}
   */
  // eslint-disable-next-line no-use-before-define
  readonly parent: Scope

  readonly log: Log

  /**
   * Provider instance for this scope
   * @type {Provider}
   */
  readonly provider: Provider

  /**
   * List of disposable objects registered within this scope
   * These objects will be disposed when this scoped is being disposed
   * @type {[service: any, (dispose: (service: any) => void)][]}
   */
  disposables?: [service: any, dispose: (service: any) => void][]

  // instances?: { id: ServiceId<unknown>; service: any }[]

  instanceMap?: Map<unknown, any>

  /**
   * Reference to a dependency resolution container (root scope) owning this scope
   * @returns {Container}
   */
  get container(): Container {
    return this.parent.container
  }

  /**
   * Registry object of the owning dependency resolution container
   * @returns {Registry}
   */
  get registry(): Registry {
    return this.container.registry
  }

  /**
   * Path of the current scope within the resolution scope tree
   * @returns {unknown[][]}
   */
  get path(): unknown[][] {
    return this.parent === this ? [this.tags] : [this.tags, ...this.parent.path]
  }

  constructor(parent: Scope, readonly tags: unknown[] = [], readonly name?: string) {
    this.parent = parent || this

    this.log = new Log(
      this.toString(),
      parent ? [...parent.log.path, this.toString()] : [this.toString()]
    )

    this.provider = new Provider(this)
  }

  toString(): string {
    return `<0x${this.id.toString(16).padStart(4, '0')} Scope${this.name ? ` ${this.name}` : ``}>`
  }

  /**
   * Creates new scope with this one as its parent
   * @param {any} tags tags of a newly created scope
   * @returns {Scope}
   */
  createScope(...tags: any[]): Scope {
    return new Scope(this, tags)
  }

  dispose() {
    this.log.debug(`disposing ${this} [${this.tags.join(', ')}]`)

    if (this.disposables !== undefined) {
      this.disposables.forEach(([service, dispose]) => dispose(service))
      this.disposables.length = 0
    }

    // if (this.instances !== undefined) {
    //   this.instances.length = 0
    // }

    if (this.instanceMap !== undefined) {
      this.instanceMap.clear()
    }
  }

  /**
   * Finds the first scope matching the given tag walking up the scope tree
   * @param tag
   * @returns {undefined | Scope}
   */
  findScope(tag: unknown): undefined | Scope {
    if (this.tags.includes(tag)) {
      return this
    }

    if (this.parent !== this) {
      return this.parent.findScope(tag)
    }

    return undefined
  }

  /**
   * Registers instance with this scope
   * If the instance is a disposable object, it will be disposed when this scope is being disposed
   * @param {ServiceId<T>} id
   * @param {Resolved<T>} service
   */
  registerInstance<T>(id: ServiceId<T>, service: Resolved<T>): void {
    // this.log.debug(`registerInstance()`, id)

    // if (this.instances === undefined) {
    //   this.instances = [{ id, service }]
    // } else {
    //   this.instances.push({ id, service })
    // }

    if (this.instanceMap === undefined) {
      this.instanceMap = new Map([[id.value, service]])
    } else {
      this.instanceMap.set(id.value, service)
    }

    const dispose = this.container.toDispose(service)

    if (dispose) {
      if (this.disposables === undefined) {
        this.disposables = [[service, dispose]]
      } else {
        this.disposables.push([service, dispose])
      }
    }
  }

  /**
   * Searches for an instance of a service with the given ID that was registered with this scope
   * @param {ServiceId<T>} id
   * @returns {undefined | Resolved<T>}
   */
  maybeGetInstance<T>(id: ServiceId<T>): undefined | Resolved<T> {
    if (this.instanceMap === undefined) {
      return undefined
    }

    return this.instanceMap.get(id.value)
  }
}
