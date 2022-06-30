import Container from '&/di/Container'
import RegistryBuilder from '&/di/RegistryBuilder'
import App from './App'
import type AppBuilder from './AppBuilder'
import type AppBuilderCore from './AppBuilderCore'
import type AppBuilderPlugin from './AppBuilderPlugin'
import type BuildAppContext from './BuildAppContext'
import type BuildResourceContext from './BuildResourceContext'
import type GetAppOptions from './GetAppOptions'
import appBuilderSymbol from './appBuilderSymbol'

export default class AppBuilderImpl<E> implements AppBuilderCore {
  readonly [appBuilderSymbol] = true

  readonly appRegistry: RegistryBuilder

  readonly buildContext: Record<string, any> = {}

  readonly plugins: AppBuilderPlugin<any>[] = []

  app?: App

  skippedBuildValidation?: boolean

  constructor() {
    this.appRegistry = new RegistryBuilder()
    this.appRegistry.registerService(App, {
      scope: 'singleton',
      factory: () => this.getApp({ build: { skipValidation: true } }),
    })
  }

  onResourceBuild(resource: any, build: () => void): void {
    const it = [...this.plugins].reverse()[Symbol.iterator]()

    const context: BuildResourceContext<any> = {
      builder: this,
      resource,
      next: (): void => {
        for (;;) {
          const res = it.next()

          if (res.done) {
            build()
            return
          }

          if (res.value.onResourceBuild) {
            res.value.onResourceBuild(context)
            return
          }
        }
      },
    }

    context.next()
  }

  getApp(options?: undefined | GetAppOptions): App {
    if (
      this.app === undefined ||
      (!options?.build?.skipValidation && this.skippedBuildValidation)
    ) {
      this.skippedBuildValidation = !!options?.build?.skipValidation
      this.app = this.build(options?.build)
    }

    return this.app
  }

  build(options?: undefined | GetAppOptions['build']): App {
    const it = [...this.plugins].reverse()[Symbol.iterator]()

    const app: any = new App()
    this.app = app

    const context: BuildAppContext<any> = {
      builder: this,
      app,
      skipValidation: !!options?.skipValidation,
      next: (): App => {
        for (;;) {
          const res = it.next()

          if (res.done) {
            app.container = new Container(this.appRegistry.build())
            app.services = app.container.provider
            return app
          }

          if (res.value.buildApp) {
            return res.value.buildApp(context)
          }
        }
      },
    }

    return context.next()
  }

  use<
    P extends new (app: AppBuilder<E>, ...args: any[]) => AppBuilderPlugin<any>,
    N = P extends new (...args: any[]) => { readonly extensions?: infer U } ? U : never
  >(plugin: P, ...args: any[]): AppBuilder<Omit<E, keyof N> & N> {
    const instance = new plugin(this as AppBuilder<any>, ...args)

    this.plugins.push(instance)

    if (instance.extensions) {
      Object.assign(
        this,
        Object.fromEntries(
          Object.entries(instance.extensions).map(([key, value]) => [
            key,
            typeof value === 'function' ? Object.assign(value.bind(this), value) : value,
          ])
        )
      )
    }

    return this as AppBuilder<any>
  }
}
