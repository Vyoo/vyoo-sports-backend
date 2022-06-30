import type Container from '&/di/Container'
import type Provider from '&/di/Provider'
import type Scope from '&/di/Scope'
import ScopeFactory from '&/di/ScopeFactory'
import Service from '&/di/Service'
import appSymbol from './appSymbol'

/**
 * Built application instance, that provides dependency injection
 * container and any additional services configured by the builder
 */
@Service({ id: appSymbol })
export default class App {
  readonly [appSymbol] = true

  readonly services!: Provider

  async runInScope<R>(
    ...args:
      | readonly [fn: (scope: Scope) => R | Promise<R>]
      | readonly [tags: readonly any[], fn: (scope: Scope) => R | Promise<R>]
  ): Promise<R> {
    let [tags, fn] = args

    if (typeof tags === 'function') {
      fn = tags
      tags = []
    }

    const scopeFactory = this.services.getService(ScopeFactory)
    const scope = scopeFactory.createScope(...tags)

    try {
      return await fn!(scope)
    } finally {
      scope.dispose()
    }
  }

  runInScopeSync<R>(
    ...args:
      | readonly [fn: (scope: Scope) => R]
      | readonly [tags: readonly any[], fn: (scope: Scope) => R]
  ): R {
    let [tags, fn] = args

    if (typeof tags === 'function') {
      fn = tags
      tags = []
    }

    const scopeFactory = this.services.getService(ScopeFactory)
    const scope = scopeFactory.createScope(...tags)

    try {
      return fn!(scope)
    } finally {
      scope.dispose()
    }
  }

  protected readonly container!: Container
}
