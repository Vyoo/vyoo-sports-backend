import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import type ServerlessHttpActionTarget from './ServerlessHttpActionTarget'

type ServerlessHttpAction<T extends ServerlessHttpActionTarget = ServerlessHttpActionTarget> = T & {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
}

export default ServerlessHttpAction
