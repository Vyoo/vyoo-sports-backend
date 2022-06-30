import type { Context } from 'aws-lambda'
import type ServerlessFuncTarget from './ServerlessFuncTarget'

type ServerlessFunc<T extends ServerlessFuncTarget = ServerlessFuncTarget> = T & {
  (event: unknown, context: Context): Promise<unknown>
}

export default ServerlessFunc
