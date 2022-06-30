import Provider from '&/di/Provider'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import Connection from './Connection'

export default class Remote {
  readonly log: Log

  readonly available: Connection[] = []

  constructor(
    readonly kind: 'reader' | 'writer',
    readonly config: {
      readonly address: string
    },
    readonly provider = inject(Provider),
    log = inject(Log)
  ) {
    this.log = log.scope(kind)
  }

  getConnection(): Connection {
    const available = this.available.pop()

    if (available) {
      return available
    }

    return this.provider.instantiate(Connection, this)
  }

  returnConnection(connection: Connection): void {
    this.available.push(connection)
  }
}
