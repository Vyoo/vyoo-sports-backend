import type ServerlessFuncConfigFn from './funcs/ServerlessFuncConfigFn'
import type ServerlessFuncTarget from './funcs/ServerlessFuncTarget'

export default class ServerlessMetadataManager {
  static getServerlessFuncId(action: Object): undefined | any {
    return Reflect.getMetadata('framework:serverless:func-id', action)
  }

  static setServerlessFuncId(action: Object, value: any): void {
    Reflect.defineMetadata('framework:serverless:func-id', value, action)
  }

  static addServerlessFuncConfig(
    target: ServerlessFuncTarget,
    config: ServerlessFuncConfigFn
  ): void {
    let existing = Reflect.getMetadata('framework:serverless:func-config', target)

    if (existing) {
      existing.push(config)
    } else {
      existing = [config]
    }

    Reflect.defineMetadata('framework:serverless:func-config', [config], target)
  }
}
