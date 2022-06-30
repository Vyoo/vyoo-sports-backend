import ServiceId from '&/di/ServiceId'
import inject from '&/di/inject'

export interface ConfigBuildFn<T> {
  (builder: { readonly env: { readonly [key: string]: undefined | string } }): T
}

export interface Configure {
  <T>(config: ConfigBuildFn<T>): T
}

const configure: Configure = build =>
  inject.custom({
    mode: 'required',
    id: ServiceId.of('framework:config:configuration'),
    args: [build],
  })

export default configure
