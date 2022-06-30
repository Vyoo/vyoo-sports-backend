import configure from '&/config/configure'
import Provider from '&/di/Provider'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import Remote from './Remote'

export default class Remotes {
  get reader(): Remote {
    if (this._reader === undefined) {
      this._reader = this.provider.instantiate(Remote, 'reader', this.config.neptune.reader)
    }

    return this._reader
  }

  get writer(): Remote {
    if (this._writer === undefined) {
      this._writer = this.provider.instantiate(Remote, 'writer', this.config.neptune.writer)
    }

    return this._writer
  }

  constructor(
    readonly provider = inject(Provider),
    readonly log = inject(Log),
    readonly config = configure(({ env }) => ({
      neptune: {
        reader: {
          address: env.NEPTUNE_READER_ADDRESS!,
        },
        writer: {
          address: env.NEPTUNE_WRITER_ADDRESS!,
        },
      },
    }))
  ) {}

  _reader?: Remote

  _writer?: Remote
}
