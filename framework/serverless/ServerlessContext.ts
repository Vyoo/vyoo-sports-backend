import type { ClientContext, CognitoIdentity, Context } from 'aws-lambda'
import Service from '&/di/Service'

@Service({ id: 'framework:serverless:context' })
export default abstract class ServerlessContext implements Context {
  abstract awsRequestId: string

  abstract callbackWaitsForEmptyEventLoop: boolean

  abstract clientContext?: undefined | ClientContext

  abstract functionName: string

  abstract functionVersion: string

  abstract identity?: undefined | CognitoIdentity

  abstract invokedFunctionArn: string

  abstract logGroupName: string

  abstract logStreamName: string

  abstract memoryLimitInMB: string

  abstract done(error?: Error, result?: any): void

  abstract fail(error: Error | string): void

  abstract getRemainingTimeInMillis(): number

  abstract succeed(messageOrObject: any): void

  abstract succeed(message: string, object: any): void
}
