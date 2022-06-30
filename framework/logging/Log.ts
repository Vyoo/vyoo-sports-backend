import isPromise from '&/utils/isPromise'

enum LogLevel {
  trace = 100,
  debug = 200,
  info = 300,
  warn = 400,
  error = 500,
}

const LogMethod = {
  [LogLevel.trace]: 'trace',
  [LogLevel.debug]: 'debug',
  [LogLevel.info]: 'info',
  [LogLevel.warn]: 'warn',
  [LogLevel.error]: 'error',
} as const

const MIN_LOG_LEVEL = LogLevel.info

export default class Log {
  static scope(
    name: string,
    async?: boolean
  ): <T extends Function>(
    _target: Object,
    _propertyKey: symbol | string,
    descriptor: TypedPropertyDescriptor<T>
  ) => void {
    const decorate = <T extends { readonly log: Log }, A extends unknown[], R>(
      method: (this: T, ...args: A) => R
    ): ((this: T, ...args: A) => R) => {
      const decorated = function (this: any, ...args: A): R {
        const { log } = this

        if (log && log instanceof Log) {
          const originalName = log.name
          const originalPath = log.path

          log.name = `.${name}`
          log.path = [...originalPath, `.${name}`]

          const result = method.apply(this, args)

          if (async === true || isPromise(result)) {
            const promise = Promise.resolve(result).finally(() => {
              log.name = originalName
              log.path = originalPath
            })

            return promise as unknown as R
          }

          log.name = originalName
          log.path = originalPath

          return result
        }

        return method.apply(this, args)
      }

      Object.defineProperty(decorated, 'name', Object.getOwnPropertyDescriptor(method, 'name')!)

      return decorated
    }

    return <T extends Function>(
      _target: Object,
      _propertyKey: symbol | string,
      descriptor: TypedPropertyDescriptor<T>
    ): void => {
      const { value } = descriptor

      if (value === undefined) {
        const { get, set } = descriptor

        if (get) {
          descriptor.get = decorate(descriptor.get as any)
        }

        if (set) {
          descriptor.set = decorate(descriptor.set as any)
        }
      } else {
        descriptor.value = decorate(descriptor.value as any) as unknown as T
      }
    }
  }

  constructor(public name: string, public path: readonly [string, ...string[]] = [name]) {}

  write(level: number, format: string, args: readonly unknown[]): void {
    if (level >= MIN_LOG_LEVEL) {
      const logLevel = (Math.floor(level / 100) * 100) as LogLevel
      const logMethod = LogMethod[logLevel]

      const formatted = this.formatMessage(format, ...args)

      // eslint-disable-next-line no-console
      console[logMethod](...formatted)
    }
  }

  trace(format: string, ...args: readonly unknown[]): void {
    this.write(LogLevel.trace, format, args)
  }

  debug(format: string, ...args: readonly unknown[]): void {
    this.write(LogLevel.debug, format, args)
  }

  info(format: string, ...args: readonly unknown[]): void {
    this.write(LogLevel.info, format, args)
  }

  warn(format: string, ...args: readonly unknown[]): void {
    this.write(LogLevel.warn, format, args)
  }

  error(format: string, ...args: readonly unknown[]): void {
    this.write(LogLevel.error, format, args)
  }

  formatMessage(format: string, ...args: readonly unknown[]): [string, ...any] {
    return [`[${this.path.join('::')}] ${format}`, ...args]
  }

  scope(name: string): Log {
    return new Log(`~${name}`, [...this.path, `~${name}`])
  }
}
