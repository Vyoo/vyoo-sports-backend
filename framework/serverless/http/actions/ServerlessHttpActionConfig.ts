import type { AwsLambdaEnvironment } from '@serverless/typescript'
import type ServerlessConfigurationFunction from '~/config/ServerlessConfigurationFunction'

export default interface ServerlessHttpActionConfig {
  readonly key?: undefined | string

  readonly handler?: undefined | string

  readonly name?: undefined | string

  readonly environment?: undefined | AwsLambdaEnvironment

  readonly tracing?: undefined | ServerlessConfigurationFunction['tracing']
}
