import type ServerlessConfiguration from './ServerlessConfiguration'

type ServerlessConfigurationFunctions = Exclude<ServerlessConfiguration['functions'], undefined>

export default ServerlessConfigurationFunctions
