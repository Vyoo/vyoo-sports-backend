// import type ServerlessConfiguration from './ServerlessConfiguration'

// type ServerlessConfigurationResourceOutput = Exclude<
//   Exclude<ServerlessConfiguration['resources'], undefined>['Outputs'],
//   undefined
// >[string]

type ServerlessConfigurationResourceOutput = Record<string, unknown>

export default ServerlessConfigurationResourceOutput
