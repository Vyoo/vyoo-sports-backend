import type BuildAppContext from '&/core/BuildAppContext'
import type ServerlessExtensions from './ServerlessExtensions'

type ServerlessModelBuildContext = Omit<
  BuildAppContext<Omit<ServerlessExtensions, 'Serverless' | 'configureServerless'>>,
  'next'
>

export default ServerlessModelBuildContext
