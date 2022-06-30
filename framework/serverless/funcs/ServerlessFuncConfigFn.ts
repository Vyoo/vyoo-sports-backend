import type ServerlessModelBuildContext from '~/ServerlessModelBuildContext'
import type ServerlessFuncConfig from './ServerlessFuncConfig'

type ServerlessFuncConfigFn =
  | Partial<ServerlessFuncConfig>
  | ((context: ServerlessModelBuildContext) => Partial<ServerlessFuncConfig>)

export default ServerlessFuncConfigFn
