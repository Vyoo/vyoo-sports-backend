import type { AwsCfInstruction } from '@serverless/typescript'
import type * as CF from 'cloudform-types'

const resource = <T extends CF.ResourceBase<object>>(
  definition: Pick<T, 'Type'> & {
    Properties?: {
      [K in keyof Exclude<T['Properties'], undefined | null>]:
        | Exclude<T['Properties'], undefined | null>[K]
        | AwsCfInstruction
    }
  } & Partial<Omit<T, 'Type' | 'Properties'>>
): {
  readonly Type: string
  readonly Properties?: Record<string, unknown>
} => definition

export default resource
