import Injector from './Injector'
import type Resolved from './Resolved'
import ServiceId from './ServiceId'
import type ServiceRequest from './ServiceRequest'

/**
 * Special magic method that provides injection functionality without decorators
 * @param {D} id requested service ID
 * @returns {Resolved<D>} service implementation matching the requested ID
 *  When no service with requested id was registered on the container, returns "default" implementation
 *  - id itself or an instance of the class when id is a class
 * @template D
 */
const inject = <D>(id: D, args?: undefined | readonly any[]): Resolved<D> =>
  inject.custom({
    mode: 'default',
    id: ServiceId.of(id),
    args,
  })

/**
 * Special inject implementation that throws an error if there's no registered implementation matching the requested ID
 * @param {D} id
 * @returns {Resolved<D>}
 */
inject.required = <D>(id: D): Resolved<D> =>
  inject.custom({ id: ServiceId.of(id), mode: 'required' })

/**
 * Special inject implementation that returns undefined instead of default service implementation
 * @param {D} id
 * @returns {undefined | Resolved<D>}
 */
inject.optional = <D>(id: D): undefined | Resolved<D> =>
  inject.custom({ id: ServiceId.of(id), mode: 'optional' })

/**
 * Underlying inject implementation that takes custom-built service request object as parameter
 * @param {ServiceRequest} request
 * @returns {any}
 */
inject.custom = (request: ServiceRequest): any => {
  const { currentProvider: provider } = Injector

  if (!provider) {
    throw new Error(`Missing ambient dependency provider`)
  }

  return provider.getServiceCore(request)
}

export default inject
