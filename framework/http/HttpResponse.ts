import type { OutgoingHttpHeaders } from 'http'
import type { Readable } from 'stream'

export default class HttpResponse {
  status(): number

  status(value: number): this

  status(value?: number): number | this {
    if (value === undefined) {
      if (this._status === undefined) {
        return this._body === null ? 201 : 200
      }

      return this._status
    }

    this._status = value
    return this
  }

  headers(): OutgoingHttpHeaders {
    return this._headers
  }

  header(name: string): undefined | string

  header(name: string, value: string): this

  header(name: string, value?: string): undefined | string | this {
    if (value === undefined) {
      const values = this._headers[name]

      if (values === undefined || typeof values === 'string') {
        return values
      }

      if (typeof values === 'number') {
        return values.toString(10)
      }

      if (Array.isArray(values) && values.length > 0) {
        return values[0]
      }

      return undefined
    }

    this._headers[name] = value
    return this
  }

  addHeader(name: string, value: string): this {
    const values = this._headers[name]

    if (values === undefined) {
      this._headers[name] = value
    } else if (Array.isArray(values)) {
      this._headers[name] = [...values, value]
    } else {
      this._headers[name] = [values.toString(), value]
    }

    return this
  }

  removeHeader(name: string): this {
    delete this._headers[name]
    return this
  }

  type(): null | string

  type(value: string): this

  type(value?: string): null | string | this {
    if (value === undefined) {
      return this.header('content-type') || null
    }

    return this.header('content-type', value)
  }

  body(): null | { text: string } | { value: any } | { stream: Readable }

  body(value: { text: string } | { value: any } | { stream: Readable }): this

  body(
    value?: { text: string } | { value: any } | { stream: Readable }
  ): null | { text: string } | { value: any } | { stream: Readable } | this {
    if (value === undefined) {
      return this._body
    }

    this._body = value
    return this
  }

  validate(): this {
    return this
  }

  _status?: number

  _headers: OutgoingHttpHeaders = {}

  _body: null | { text: string } | { value: any } | { stream: Readable } = null
}
