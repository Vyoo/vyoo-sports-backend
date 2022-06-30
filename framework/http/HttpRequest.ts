import type { URL } from 'url'
import Ajv, { ErrorObject } from 'ajv'
// import multiValueDictAsList from '&/utils/multiValueDictAsList'
// import multiValueDictAsLookup from '&/utils/multiValueDictAsLookup'
import type HttpRequestBody from './HttpRequestBody'
import type HttpRequestHeaders from './HttpRequestHeaders'
import type HttpRequestPathParams from './HttpRequestPathParams'
import type HttpRequestQueryParams from './HttpRequestQueryParams'
import type SchemaNode from './schema/SchemaNode'

const ajv = new Ajv()

const formatAjvError = (err: ErrorObject): string =>
  `${err.instancePath} ${err.message} ${err.data}`

// const getMultiValueDictValue = (dict: MultiValueDict<string>, key?: undefined | string) => {
//   if (key) {
//     const list = multiValueDictAsList(dict)
//     const matches = list.filter(([name]) => name === key).map(x => x[1])
//     return matches.length > 1 ? matches : matches[0]
//   }
//
//   return multiValueDictAsLookup(dict)
// }

const getMultiValueDictValue = (
  dict: readonly [string, string][],
  key?: undefined | string,
  transformKey?: (key: string) => string
): undefined | string | string[] | { readonly [key: string]: undefined | string | string[] } => {
  if (key) {
    const matches = dict
      .filter(
        transformKey
          ? ([name]) => transformKey(name) === transformKey(key)
          : ([name]) => name === key
      )
      .map(x => x[1])

    return matches.length > 1 ? matches : matches[0]
  }

  const result: { [key: string]: undefined | string | string[] } = {}

  dict.forEach(([name, value]) => {
    if (value.length > 0) {
      const entryKey = transformKey ? transformKey(name) : name

      const entry = result[entryKey]

      if (entry === undefined) {
        result[entryKey] = value
      } else if (typeof entry === 'string') {
        result[entryKey] = [entry, value]
      } else {
        entry.push(value)
      }
    }
  })

  return result
}

const shouldValidate = (value: undefined | unknown | unknown[], optional: boolean): boolean =>
  !optional || (value !== undefined && (!Array.isArray(value) || value.length > 0))

export default class HttpRequest {
  readonly remoteAddr!: null | string

  readonly remotePort!: null | number

  readonly method!: string

  readonly rawUrl!: string

  readonly url!: URL

  readonly prefix!: string

  readonly headers!: HttpRequestHeaders

  readonly params!: HttpRequestPathParams

  readonly query!: HttpRequestQueryParams

  // TODO
  // readonly cookies!:

  readonly body!: HttpRequestBody

  constructor(data: {
    readonly remoteAddr: null | string
    readonly remotePort: null | number
    readonly method: string
    readonly rawUrl: string
    readonly url: URL
    readonly prefix: string
    readonly headers: HttpRequestHeaders
    readonly params: HttpRequestPathParams
    readonly query: HttpRequestQueryParams
    // TODO: readonly cookies
    readonly body: HttpRequestBody
  }) {
    Object.assign<this, typeof data>(this, data)
  }

  header(name: string): string[] {
    return this.headers.filter(([n]) => n.toLowerCase() === name).map(x => x[1])
  }

  readHeaders<T>(schema: SchemaNode, name?: string): T {
    // console.log('HEADERS:', multiValueDictAsLookup(this.headers))

    const value = getMultiValueDictValue(this.headers, name, x => x.toLowerCase()) as unknown as T

    // console.log('VALUE:', name, value)

    if (shouldValidate(value, schema.$$optional)) {
      if (!ajv.validate(schema.$$jsonSchema, value)) {
        throw new Error(
          `Headers validation failed${name ? ` on key "${name}"` : ``}${
            ajv.errors ? `\r\n${ajv.errors.map(formatAjvError).join('\r\n')}` : ``
          }`
        )
      }
    }

    return value
  }

  readParams<T>(schema: SchemaNode, name?: string): T {
    const value = getMultiValueDictValue(this.params, name) as unknown as T

    if (shouldValidate(value, schema.$$optional)) {
      if (!ajv.validate(schema.$$jsonSchema, value)) {
        throw new Error(
          `Path parameters validation failed${name ? ` on key "${name}"` : ``}${
            ajv.errors ? `\r\n${ajv.errors.map(formatAjvError).join('\r\n')}` : ``
          }`
        )
      }
    }

    return value
  }

  readQuery<T>(schema: SchemaNode, name?: string): T {
    const value = getMultiValueDictValue(this.query, name) as unknown as T

    if (shouldValidate(value, schema.$$optional)) {
      if (!ajv.validate(schema.$$jsonSchema, value)) {
        throw new Error(
          `Query parameters validation failed${name ? ` on key "${name}"` : ``}${
            ajv.errors ? `\r\n${ajv.errors.map(formatAjvError).join('\r\n')}` : ``
          }`
        )
      }
    }

    return value
  }

  readBodySync<T>(schema: SchemaNode): T {
    const body = this.body.jsonSync<T>()

    if (shouldValidate(body, schema.$$optional)) {
      if (!ajv.validate(schema.$$jsonSchema, body)) {
        throw new Error(
          `Request body validation failed\r\n${JSON.stringify(schema.$$jsonSchema, null, 2)}${
            ajv.errors ? `\r\n${ajv.errors.map(formatAjvError).join('\r\n')}` : ``
          }`
        )
      }
    }

    return body
  }
}
