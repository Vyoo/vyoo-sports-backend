import HttpRequest from './HttpRequest'
import HttpResponse from './HttpResponse'

let nextId = 0

export default class HttpProvider {
  readonly id = nextId++

  get request(): undefined | HttpRequest {
    // console.log(`[HttpProvider#${this.id}] get request()`)
    return this._request
  }

  get response(): undefined | HttpResponse {
    // console.log(`[HttpProvider#${this.id}] get response()`)
    return this._response
  }

  // constructor() {
  //   if (this.id > 0) {
  //     throw new Error(`WTF`)
  //   }
  // }

  handleHandlerStart(request: HttpRequest): void {
    // console.log(`[HttpProvider#${this.id}] handleHandlerStart()`)

    this._request = request
    this._response = new HttpResponse()
  }

  _request?: HttpRequest

  _response?: HttpResponse
}
