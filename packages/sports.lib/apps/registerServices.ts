// eslint-disable-next-line import/no-extraneous-dependencies
import { CognitoIdentityServiceProvider } from 'aws-sdk'
import XRay from 'aws-xray-sdk-core'
import type RegistryBuilder from '&/di/RegistryBuilder'
import isInServerlessContext from '&/serverless/isInServerlessContext'
import isInServerlessOfflineContext from '&/serverless/isInServerlessOfflineContext'
import GremlinReader from '$/graph/gremlin/Reader'
import GremlinRemotes from '$/graph/gremlin/Remotes'
import GremlinWriter from '$/graph/gremlin/Writer'
import User from '~/auth/User'
import UserProvider from '~/auth/UserProvider'

const registerServices = (registry: RegistryBuilder): void => {
  registry.registerService(CognitoIdentityServiceProvider, {
    factory: () =>
      isInServerlessContext() && !isInServerlessOfflineContext()
        ? XRay.captureAWSClient(new CognitoIdentityServiceProvider())
        : new CognitoIdentityServiceProvider(),
  })

  registry.registerService(GremlinRemotes, { scope: 'singleton' })
  registry.registerService(GremlinReader, { scope: 'request' })
  registry.registerService(GremlinWriter, { scope: 'request' })

  registry.registerService(UserProvider, { scope: 'request' })

  registry.registerService(User, {
    factory: ctx => ctx.provider.getRequiredService(UserProvider).user,
  })
}

export default registerServices
