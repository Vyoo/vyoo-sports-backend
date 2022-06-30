import type DeepPartial from '&/utils/DeepPartial'
import type ServerlessConfiguration from './ServerlessConfiguration'

type ServerlessConfigurationOverrides = Omit<
  DeepPartial<ServerlessConfiguration>,
  'service' | 'resources'
> & {
  readonly service: string
} & Pick<ServerlessConfiguration, 'resources'>

export default ServerlessConfigurationOverrides
