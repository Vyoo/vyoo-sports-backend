import type { JSONSchemaType } from 'ajv'

// type JsonSchemaFragment = Record<string, any>

type JsonSchemaFragment = Partial<JSONSchemaType<unknown>>

export default JsonSchemaFragment
