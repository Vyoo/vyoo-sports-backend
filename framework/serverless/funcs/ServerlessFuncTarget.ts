import type { Context } from 'aws-lambda'

export default interface ServerlessFuncTarget {
  new (...args: readonly any[]): {
    exec(event: unknown, context: Context): unknown
  }
}
