import type ApiActionModel from './ApiActionModel'

export default class ApiRouteModel {
  constructor(readonly method: string, readonly path: string, readonly actions: ApiActionModel[]) {}

  withPrefix(pathPrefix: string): ApiRouteModel {
    return new ApiRouteModel(this.method, `${pathPrefix}/${this.path}`, this.actions)
  }

  withMethod(method: string): ApiRouteModel {
    return new ApiRouteModel(method, this.path, this.actions)
  }
}
