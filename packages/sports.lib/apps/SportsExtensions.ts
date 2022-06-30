import type { Fn } from 'cloudform-types'
import type AppBuilder from '&/core/AppBuilder'
import type ServerlessConfiguration from '&/serverless/config/ServerlessConfiguration'
import type ServerlessConfigurationOverrides from '&/serverless/config/ServerlessConfigurationOverrides'
import type Auth from '~/auth/Auth'
import type { Role } from '~/enums'
import type FinalExtensions from './FinalExtensions'
import type resource from './resource'

export default interface SportsExtensions {
  Auth: typeof Auth

  Role: typeof Role

  configureServerless<This extends AppBuilder<FinalExtensions>>(
    this: This,
    overrides:
      | ServerlessConfigurationOverrides
      | ((context: {
          readonly Fn: typeof Fn
          readonly resource: typeof resource
        }) => ServerlessConfigurationOverrides)
  ): ServerlessConfiguration
}
