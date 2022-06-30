import type OpenApiParameter from './OpenApiParameter'
import type OpenApiPathMethod from './OpenApiPathMethod'
import type OpenApiRef from './OpenApiRef'

type OpenApiPath<
  E extends { [method: string]: undefined | OpenApiPathMethod } = {
    get?: undefined | OpenApiPathMethod
    put?: undefined | OpenApiPathMethod
    post?: undefined | OpenApiPathMethod
    delete?: undefined | OpenApiPathMethod
    options?: undefined | OpenApiPathMethod
    head?: undefined | OpenApiPathMethod
    patch?: undefined | OpenApiPathMethod
    trace?: undefined | OpenApiPathMethod
  }
> = Omit<E, 'summary' | 'description' | 'parameters'> & {
  summary?: string
  description?: string
  parameters?: (OpenApiRef | OpenApiParameter)[]
}

export default OpenApiPath
