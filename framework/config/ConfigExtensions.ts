import type ConfigProvider from './ConfigProvider'

export default interface ConfigExtensions {
  readonly config: {
    readonly provider: ConfigProvider
  }
}
