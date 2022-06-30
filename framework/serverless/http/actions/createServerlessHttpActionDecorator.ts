import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import destroy from 'destroy'
import type App from '&/core/App'
import type GetAppOptions from '&/core/GetAppOptions'
import HttpMetadataManager from '&/http/HttpMetadataManager'
import type HttpModel from '&/http/HttpModel'
import HttpService from '&/http/HttpService'
import ServerlessModel from '~/ServerlessModel'
import ServerlessProvider from '~/ServerlessProvider'
import type ServerlessHttpAction from './ServerlessHttpAction'
import type ServerlessHttpActionConfigFn from './ServerlessHttpActionConfigFn'
import type ServerlessHttpActionDecorator from './ServerlessHttpActionDecorator'
import type ServerlessHttpActionTarget from './ServerlessHttpActionTarget'
import createHttpRequestFromApiGatewayEvent from './createHttpRequestFromApiGatewayEvent'

const createServerlessHttpActionDecorator = function ServerlessHttpActionCreator(
  this: {
    getApp(options?: undefined | GetAppOptions): App

    readonly http: {
      readonly model: HttpModel
    }

    readonly serverless: {
      readonly model: ServerlessModel
    }
  },
  config?: undefined | ServerlessHttpActionConfigFn
): ServerlessHttpActionDecorator {
  return <Target extends ServerlessHttpActionTarget>(
    target: Target
  ): ServerlessHttpAction<Target> => {
    const actionModel = this.http.model.registerAction(target)

    this.serverless.model.registerHttpAction(actionModel, config)

    const proxy = new Proxy(target, {
      apply: async (
        currentTarget: Target,
        _thisArg: any,
        argArray: [event: APIGatewayProxyEvent, context: Context]
      ): Promise<APIGatewayProxyResult> => {
        process.env.IN_SERVERLESS_CONTEXT = 'true'

        try {
          const [event, context] = argArray

          const app = this.getApp({
            build: {
              skipValidation: true,
            },
          })

          const httpService = app.services.getRequiredService(HttpService)

          const request = createHttpRequestFromApiGatewayEvent(event)

          const response = await httpService.executeAction(currentTarget, request, scope => {
            const serverlessProvider = scope.provider.getRequiredService(ServerlessProvider)
            serverlessProvider.handleHandlerStart(event, context)
          })

          const statusCode = response.status()

          const headers = response.headers()

          const body = response.body()

          let bodyAsString: string = ''

          if (body) {
            if ('text' in body && body.text !== undefined) {
              bodyAsString = body.text
            } else if ('value' in body && body.value !== undefined) {
              bodyAsString = JSON.stringify(body.value)
            } else if ('stream' in body && body.stream !== undefined) {
              const { stream } = body

              bodyAsString = await new Promise<string>((resolve, reject) => {
                const chunks: string[] | Buffer[] = []

                stream.on('error', reject)

                stream.on('data', chunk => chunks.push(chunk))

                stream.on('end', () => {
                  if (chunks.length === 0) {
                    resolve('')
                  } else if (typeof chunks[0] === 'string') {
                    resolve(chunks.join(''))
                  } else {
                    resolve(Buffer.concat(chunks as Buffer[]).toString('utf8'))
                  }
                })
              }).finally(() => {
                destroy(stream)
              })
            }
          }

          return {
            statusCode,
            multiValueHeaders: Object.fromEntries(
              Object.entries(headers).map(([key, values]) => [
                key,
                values === undefined ? [] : Array.isArray(values) ? values : [values],
              ])
            ),
            body: bodyAsString,
          }
        } catch (exc) {
          // eslint-disable-next-line no-console
          console.error(`HTTP action execution failed:\r\n`, exc)

          return {
            statusCode: 500,
            headers: {
              'content-type': 'text/plain',
            },
            body: `${exc}`,
          }
        }
      },
    }) as ServerlessHttpAction<Target>

    HttpMetadataManager.setUnderlyingObject(proxy, target)
    HttpMetadataManager.setHttpActionId(proxy, actionModel.id)
    this.http.model.registerAction(proxy)

    return proxy
  }
}

export default createServerlessHttpActionDecorator
