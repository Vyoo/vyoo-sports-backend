import type ServerlessConfigurationFunction from './ServerlessConfigurationFunction'

type ServerlessConfigurationFunctionEvents = Exclude<
  ServerlessConfigurationFunction['events'],
  undefined
>

export default ServerlessConfigurationFunctionEvents
