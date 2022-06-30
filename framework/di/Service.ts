import ServiceId from './ServiceId'

/**
 * Decorator used to manipulate resolution-related attributes of a class that can be used as a service ID
 * @param {{readonly id?: unknown, readonly name?: string}} config
 *  id - allows to override the default generated service ID of the object
 *  name - allows to override the default generate service name of the object
 * @returns {ClassDecorator}
 * @constructor
 */
const Service =
  (config: { readonly id?: unknown; readonly name?: string }): ClassDecorator =>
  <T extends Function>(target: T): void => {
    if (config.id) {
      ServiceId.setId(target, config.id)
    }

    if (config.name) {
      ServiceId.setName(target, config.name)
    }
  }

export default Service
