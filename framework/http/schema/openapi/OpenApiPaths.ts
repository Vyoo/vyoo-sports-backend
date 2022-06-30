import type OpenApiPath from './OpenApiPath'
import type OpenApiRef from './OpenApiRef'

export default interface OpenApiPaths {
  [path: string]: OpenApiRef | OpenApiPath
}
