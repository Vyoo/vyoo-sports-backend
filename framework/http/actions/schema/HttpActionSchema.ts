import type { AwsCfInstruction } from '@serverless/typescript'
import type SchemaNode from '~/schema/SchemaNode'

type ServerlessActionSchema = {
  request?: {
    contentHandling?: 'CONVERT_TO_BINARY' | 'CONVERT_TO_TEXT'
    method?: string
    parameters?: {
      querystrings?: {
        [k: string]:
          | boolean
          | {
              required?: boolean
              mappedValue?: AwsCfInstruction
            }
      }
      headers?: {
        [k: string]:
          | boolean
          | {
              required?: boolean
              mappedValue?: AwsCfInstruction
            }
      }
      paths?: {
        [k: string]:
          | boolean
          | {
              required?: boolean
              mappedValue?: AwsCfInstruction
            }
      }
    }
    passThrough?: 'NEVER' | 'WHEN_NO_MATCH' | 'WHEN_NO_TEMPLATES'
    schemas?: {
      [k: string]:
        | {
            [k: string]: unknown
          }
        | string
    }
    template?: {
      [k: string]: string
    }
    uri?: AwsCfInstruction
  }
  response?: {
    contentHandling?: 'CONVERT_TO_BINARY' | 'CONVERT_TO_TEXT'
    headers?: {
      [k: string]: string
    }
    template?: string
    statusCodes?: {
      [k: string]: {
        headers?: {
          [k: string]: string
        }
        pattern?: string
        template?:
          | string
          | {
              [k: string]: string
            }
      }
    }
  }
}

export interface MutableHttpActionSchema {
  serverless?: undefined | ServerlessActionSchema

  headers?: undefined | { [name: string]: SchemaNode }

  params?: undefined | { [name: string]: SchemaNode }

  query?: undefined | { [name: string]: SchemaNode }

  body?: undefined | SchemaNode

  result?: undefined | SchemaNode
}

type HttpActionSchema = {
  readonly [K in keyof Omit<
    MutableHttpActionSchema,
    'headers' | 'params' | 'query'
  >]?: MutableHttpActionSchema[K]
} & {
  headers?: { readonly [name: string]: SchemaNode }

  params?: { readonly [name: string]: SchemaNode }

  query?: { readonly [name: string]: SchemaNode }
}

export default HttpActionSchema
