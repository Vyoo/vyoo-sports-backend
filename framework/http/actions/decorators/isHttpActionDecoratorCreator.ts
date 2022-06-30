import type HttpActionDecoratorCreator from './HttpActionDecoratorCreator'

const isHttpActionDecoratorCreator = (obj: any): obj is HttpActionDecoratorCreator =>
  typeof obj === 'function' && obj['framework:http:action-decorator-creator'] === true

export default isHttpActionDecoratorCreator
