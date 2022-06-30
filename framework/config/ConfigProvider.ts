export default class ConfigProvider {
  readonly allUsedEnvironmentVariables: string[] = []

  readonly usedEnvironmentVariables = new Map<any, string[]>()

  readonly stack: any[] = []

  readonly env: typeof process.env

  constructor(options?: undefined | { readonly env?: typeof process.env }) {
    this.env = options?.env ?? process.env
  }

  beginTrackingSegment(target: any): void {
    this.stack.push(target)
  }

  endTrackingSegment(): void {
    this.stack.pop()
  }

  markEnvironmentVariableAsUsed(name: string): void {
    let list: string[]

    const stackLength = this.stack.length

    if (stackLength === 0) {
      list = this.allUsedEnvironmentVariables
    } else {
      const target = this.stack[stackLength - 1]
      list = this.usedEnvironmentVariables.get(target)!

      if (list === undefined) {
        list = []
        this.usedEnvironmentVariables.set(target, list)
      }
    }

    if (!list.includes(name)) {
      list.push(name)
    }
  }

  provideConfiguration<T>(build: (builder: { readonly env: typeof process.env }) => T): T {
    const proxy = new Proxy(this.env, {
      get: (target, propertyKey: string) => {
        this.markEnvironmentVariableAsUsed(propertyKey)
        return target[propertyKey]
      },
    })

    return build({ env: proxy })
  }
}
