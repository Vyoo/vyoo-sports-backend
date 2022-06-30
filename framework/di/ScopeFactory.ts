import type Scope from './Scope'
import Service from './Service'
import scopeFactorySymbol from './scopeFactorySymbol'

/**
 * Resolution scope factory service
 */
@Service({ id: scopeFactorySymbol })
export default abstract class ScopeFactory {
  abstract createScope(...tags: any[]): Scope
}
