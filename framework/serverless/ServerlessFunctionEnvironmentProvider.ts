import Service from '&/di/Service'
import type ServerlessFuncModel from './funcs/ServerlessFuncModel'
import type ServerlessHttpActionModel from './http/actions/ServerlessHttpActionModel'

@Service({ id: 'framework:serverless:function-environment-provider' })
export default abstract class ServerlessFunctionEnvironmentProvider {
  abstract provideEnvironment(
    model: ServerlessFuncModel | ServerlessHttpActionModel
  ): typeof process.env
}
