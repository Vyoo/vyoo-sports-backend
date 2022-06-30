import HttpExtensions from '&/http/HttpExtensions'
import ServerlessExtensions from '&/serverless/ServerlessExtensions'

export default interface RequiredExtensions
  extends Omit<HttpExtensions, 'registerAction' | 'configureActions' | 'Action'>,
    ServerlessExtensions {}
