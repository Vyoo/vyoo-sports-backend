import type ServerlessConfiguration from './ServerlessConfiguration'

type ServerlessConfigurationResourceDefinition = Exclude<
  Exclude<ServerlessConfiguration['resources'], undefined>['Resources'],
  undefined
>[string]

export default ServerlessConfigurationResourceDefinition
