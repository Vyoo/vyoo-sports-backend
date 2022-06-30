import 'reflect-metadata'
import serviceIdNameSymbol from './serviceIdNameSymbol'
import serviceIdSymbol from './serviceIdSymbol'
import serviceIdValueSymbol from './serviceIdValueSymbol'

let nextUid = 1

/**
 * Represents the ID of a given service
 */
export default class ServiceId<V = any> {
  // static readonly map = new WeakMap<any, ServiceId<any>>()

  /**
   * Checks if a given object is a valid service ID instance
   * @param obj
   * @returns {obj is ServiceId<T>}
   */
  static isServiceId<T = any>(obj: any): obj is ServiceId<T> {
    return obj !== null && typeof obj === 'object' && obj[serviceIdSymbol] === true
  }

  /**
   * Creates service ID object out of a provided ID value
   * @param {T} value
   * @returns {ServiceId<T>}
   */
  static of<T>(value: T): ServiceId<T> {
    if (ServiceId.isServiceId<T>(value)) {
      return value
    }

    const type = value === null ? 'null' : typeof value

    let actualValue = value
    let actualType = type

    if (value !== null) {
      if (type === 'function' || type === 'object') {
        const setId = Reflect.getMetadata(serviceIdValueSymbol, value)

        if (setId !== undefined) {
          actualValue = setId
          actualType = actualValue === null ? 'null' : typeof actualValue
        }
      }
    }

    // const existing = ServiceId.map.get(value)

    // if (existing) {
    //   return existing
    // }

    let name =
      type === 'object' || type === 'function'
        ? Reflect.getMetadata(serviceIdNameSymbol, value)
        : undefined

    if (name === undefined) {
      switch (actualType) {
        case 'undefined':
          throw new Error(`Service ID can not be undefined`)

        case 'symbol':
          name = (actualValue as unknown as symbol).toString()
          break

        case 'function':
          name = ('name' in actualValue && (actualValue as unknown as Function).name) || ''
          break

        case 'object':
          name = actualValue === null ? 'null' : ''
          break

        default:
          name = `${actualValue}`
          break
      }
    }

    const id = new ServiceId(actualValue, name)

    // ServiceId.map.set(value, id)

    return id
  }

  static setId(obj: Object, value: any): void {
    Reflect.defineMetadata(serviceIdValueSymbol, value, obj)
  }

  static setName(obj: Object, value: string): void {
    Reflect.defineMetadata(serviceIdNameSymbol, value, obj)
  }

  readonly [serviceIdSymbol] = true

  readonly uid = nextUid++

  /**
   * Human-readable representation of this service ID
   * @returns {string}
   */
  toString(): string {
    if (this._toString === undefined) {
      this._toString = `<0x${this.uid.toString(16).padStart(4, '0')}${
        this.name ? ` ${this.name}` : ``
      }>`
    }

    return this._toString
  }

  /**
   * Equality check between two service ID objects
   * @param {ServiceId} other
   * @returns {other is ServiceId<V>}
   */
  equals(other: ServiceId): other is ServiceId<V> {
    return this.value === other.value
  }

  protected constructor(readonly value: V, readonly name: string) {}

  private _toString?: string
}
