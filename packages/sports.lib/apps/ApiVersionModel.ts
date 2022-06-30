import type ApiRouteModel from './ApiRouteModel'

export default class ApiVersionModel {
  get string(): string {
    if (this._string === undefined) {
      this._string = this.sub ? `${this.ver}@${this.sub}` : this.ver
    }

    return this._string
  }

  constructor(
    readonly ver: string,
    readonly sub: undefined | string,
    readonly routes: ApiRouteModel[],
    readonly subs?: undefined | ApiVersionModel[]
  ) {}

  _string?: string
}
