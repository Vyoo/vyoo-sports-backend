import type ServerlessModelBuildContext from '~/ServerlessModelBuildContext'
import type ServerlessHttpActionConfig from './ServerlessHttpActionConfig'

type ServerlessHttpActionConfigFn =
  | Partial<ServerlessHttpActionConfig>
  | ((context: ServerlessModelBuildContext) => Partial<ServerlessHttpActionConfig>)

export default ServerlessHttpActionConfigFn
