import aws4 from 'aws4'
import * as gremlin from 'gremlin'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import type Remote from './Remote'

export default class Connection
  extends gremlin.driver.DriverRemoteConnection
  implements gremlin.driver.RemoteConnection
{
  readonly log: Log

  constructor(readonly remote: Remote, log = inject(Log)) {
    /* eslint-disable node/no-process-env */

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID!

    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!

    const sessionToken = process.env.AWS_SESSION_TOKEN!

    const parts = remote.config.address.split('.')
    const region = parts[parts.length - 3] || process.env.AWS_DEFAULT_REGION!

    /* eslint-enable node/no-process-env */

    const awsCreds = { accessKeyId, secretAccessKey, sessionToken }

    const sigOptions = {
      host: remote.config.address,
      region,
      path: '/gremlin',
      service: 'neptune-db',
    }

    const url = `wss://${remote.config.address}/gremlin`

    const { headers } = aws4.sign(sigOptions, awsCreds)

    super(url, {
      headers,
      connectOnStartup: false,
      mimeType: 'application/vnd.gremlin-v2.0+json',
      pingEnabled: true,
      pingInterval: 1000,
      pongTimeout: 2000,
      secure: true,
      autoReconnect: true,
      region,
    })

    this.log = log.scope(this.remote.kind)
  }
}
