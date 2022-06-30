import type ServerlessConfiguration from './config/ServerlessConfiguration'
import type ServerlessConfigurationOverrides from './config/ServerlessConfigurationOverrides'

export default interface ConfigureServerless {
  (overrides?: undefined | ServerlessConfigurationOverrides): ServerlessConfiguration
}
