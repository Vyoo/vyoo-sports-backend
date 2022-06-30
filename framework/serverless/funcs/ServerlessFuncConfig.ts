import type ServerlessConfigurationFunction from '~/config/ServerlessConfigurationFunction'

type ServerlessFuncConfig = Omit<ServerlessConfigurationFunction, 'handler' | 'name'> & {
  readonly key?: undefined | string

  readonly handler: string

  readonly name?: undefined | string
}

export default ServerlessFuncConfig
