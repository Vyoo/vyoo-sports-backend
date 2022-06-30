import type RegistryBuilder from '&/di/RegistryBuilder'
import type App from './App'
import type GetAppOptions from './GetAppOptions'

/**
 * Core functionality of an {AppBuilder}
 */
export default interface AppBuilderCore {
  readonly buildContext: Record<string, any>

  readonly appRegistry: RegistryBuilder

  onResourceBuild(resource: any, build: () => void): void

  getApp(options?: undefined | GetAppOptions): App
}
