import type ServiceId from './ServiceId'

/**
 * Object representing a resolution request for a dependency
 */
export default interface ServiceRequest<T = unknown> {
  readonly mode: 'default' | 'required' | 'optional'
  readonly id: ServiceId<T>
  readonly args?: undefined | readonly any[]
}
