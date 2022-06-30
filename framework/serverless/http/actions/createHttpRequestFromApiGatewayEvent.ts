import { Readable } from 'stream'
import { URL, URLSearchParams } from 'url'
import type {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2WithRequestContext,
} from 'aws-lambda'
import HttpRequest from '&/http/HttpRequest'
import type HttpRequestBody from '&/http/HttpRequestBody'
import isInServerlessOfflineContext from '~/isInServerlessOfflineContext'

const isV2 = (
  event: any
): event is APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2> =>
  'version' in event && event.version

const createHttpRequestFromApiGatewayEvent = (
  event:
    | APIGatewayProxyEvent
    | APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
): HttpRequest => {
  // console.log(`aws event:`, event)

  let rawUrl = `${
    event.headers?.['x-forwarded-proto'] || isInServerlessOfflineContext() ? 'http' : 'https'
  }://`

  rawUrl +=
    (isInServerlessOfflineContext() ? null : event.requestContext?.domainName) ||
    event.headers.host ||
    'unknown'

  rawUrl +=
    'rawPath' in event
      ? event.rawPath
      : `${event.requestContext?.stage ? `/${event.requestContext.stage}` : ``}${event.path}`

  if (isV2(event)) {
    if (event.rawQueryString) {
      rawUrl += `?${event.rawQueryString}`
    }
  } else if (event.queryStringParameters) {
    const entries = Object.entries(event.queryStringParameters)
    const values = entries.map(([key, value]): [string, string] => [key, value || ''])
    rawUrl += `?${new URLSearchParams(values).toString()}`
  }

  const remoteAddr =
    event.headers?.['x-forwarded-for']?.split(',', 2)?.[0] ??
    (isV2(event) ? event.requestContext?.http?.sourceIp : event.requestContext?.identity?.sourceIp)

  const remotePort = null

  const method = isV2(event) ? event.requestContext.http.method : event.httpMethod
  const url = new URL(rawUrl)

  const prefix = event.requestContext?.stage ? `/${event.requestContext.stage}` : ``

  // const headers = createMultiValueDict<string>(
  //   Object.entries(event.headers).flatMap(([name, value]): [string, string][] =>
  //     typeof value === 'string' ? value.split(',').map(item => [name, item]) : []
  //   ),
  //   name => name.toLowerCase()
  // )
  const headers =
    'multiValueHeaders' in event && event.multiValueHeaders
      ? Object.entries(event.multiValueHeaders).flatMap(([name, values]): [string, string][] =>
          values === undefined ? [[name, '']] : values.map(value => [name, value])
        )
      : Object.entries(event.headers ?? {}).flatMap(([name, values]): [string, string][] =>
          values === undefined
            ? [[name, '']]
            : Array.isArray(values)
            ? values.map(value => [name, value])
            : [[name, values]]
        )

  // const params = createMultiValueDict<string>(
  //   event.pathParameters
  //     ? (Object.entries(event.pathParameters).filter(x => typeof x[1] === 'string') as [
  //         string,
  //         string
  //       ][])
  //     : []
  // )
  const params = Object.entries(event.pathParameters || {}).flatMap(
    ([name, values]): [string, string][] =>
      values === undefined
        ? [[name, '']]
        : Array.isArray(values)
        ? values.map(value => [name, value])
        : [[name, values]]
  )

  // const query = createMultiValueDict<string>(
  //   event.queryStringParameters
  //     ? Object.entries(event.queryStringParameters).flatMap(
  //         ([name, value]): [string, string][] =>
  //           typeof value === 'string' ? value.split(',').map(item => [name, item]) : []
  //       )
  //     : []
  // )
  const query =
    'multiValueQueryStringParameters' in event
      ? Object.entries(event.multiValueQueryStringParameters || {}).flatMap(
          ([name, values]): [string, string][] =>
            values === undefined ? [[name, '']] : values.map(value => [name, value])
        )
      : Object.entries(event.queryStringParameters || {}).flatMap(
          ([name, values]): [string, string][] =>
            values === undefined
              ? [[name, '']]
              : Array.isArray(values)
              ? values.map(value => [name, value])
              : [[name, values]]
        )

  const bodyRaw = () => {
    const stream = new Readable()
    stream._read = () => {}
    stream.push(event.body || '')
    stream.push(null)
    return stream
  }

  const bodyBinary = () => Buffer.from(event.body || '', 'utf8')

  const bodyText = () => event.body || ''

  const bodyJson = <T>() => (event.body ? JSON.parse(event.body) : undefined) as T

  const bodyUrlencoded = () => {
    const parsed = new URLSearchParams(event.body || '')

    // const dict = createMultiValueDict<string>(
    //   Object.entries(parsed).flatMap(([name, values]): [string, string][] =>
    //     typeof values === 'string'
    //       ? [[name, values]]
    //       : Array.isArray(values)
    //       ? values.map(value => [name, value])
    //       : []
    //   )
    // )

    const dict = Array.from(parsed.keys()).flatMap(key =>
      parsed.getAll(key).map((value): [string, string] => [key, value])
    )

    return dict
  }

  const body: HttpRequestBody = {
    raw: bodyRaw,

    binary: (): Promise<Buffer> => Promise.resolve(bodyBinary()),

    binarySync: bodyBinary,

    text: (): Promise<string> => Promise.resolve(bodyText()),

    textSync: bodyText,

    json: <T>(): Promise<T> => Promise.resolve(bodyJson<T>()),

    jsonSync: bodyJson,

    urlencoded: () => Promise.resolve(bodyUrlencoded()),

    urlencodedSync: bodyUrlencoded,
  }

  return new HttpRequest({
    remoteAddr,
    remotePort,
    method,
    rawUrl,
    url,
    prefix,
    headers,
    params,
    query,
    body,
  })
}

export default createHttpRequestFromApiGatewayEvent
