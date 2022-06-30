import type Registry from './Registry'
import Scope from './Scope'
import Service from './Service'
import containerSymbol from './containerSymbol'
import dispose from './dispose'
import toDispose from './toDispose'

/**
 * Root dependency resolution scope
 */
@Service({ id: containerSymbol })
export default class Container extends Scope {
  /**
   * Checks if the provided object is a valid container instance
   * @param obj
   * @returns {obj is Container}
   */
  static override isInstance(obj: any): obj is Container {
    return obj !== null && typeof obj === 'object' && obj[containerSymbol] === true
  }

  readonly [containerSymbol] = true

  /**
   * Registry of this container
   * @returns {Registry}
   */
  override get registry(): Registry {
    return this._registry
  }

  /**
   * Returns this
   * @returns {this}
   */
  override get container(): this {
    return this
  }

  constructor(
    registry: Registry,
    readonly options: {
      toDispose: undefined | null | (<T>(obj: T) => undefined | null | false | ((obj: T) => void))
    } = {
      toDispose,
    }
  ) {
    super(null as any, ['dependency', 'singleton', 'container', '$'])

    // this.log.debug(`[DependencyContainer] ctor()`)

    this._registry = registry
  }

  /**
   * Returns disposal function for a given object if applicable
   * @param {T} obj
   * @returns {((obj: T) => void) | undefined}
   */
  toDispose<T>(obj: T): undefined | ((obj: T) => void) {
    if (Scope.isInstance(obj)) {
      return dispose
    }

    return this.options.toDispose ? this.options.toDispose(obj) || undefined : undefined
  }

  readonly _registry: Registry
}
