import type OpenApiArraySchema from './OpenApiArraySchema'
import type OpenApiBooleanSchema from './OpenApiBooleanSchema'
import type OpenApiNumberSchema from './OpenApiNumberSchema'
import type OpenApiObjectSchema from './OpenApiObjectSchema'
import type OpenApiStringSchema from './OpenApiStringSchema'

type OpenApiSchema =
  | OpenApiArraySchema
  | OpenApiBooleanSchema
  | OpenApiNumberSchema
  | OpenApiObjectSchema
  | OpenApiStringSchema

export default OpenApiSchema
