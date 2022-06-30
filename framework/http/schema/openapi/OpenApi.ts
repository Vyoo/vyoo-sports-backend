import type OpenApiComponents from './OpenApiComponents'
import type OpenApiPaths from './OpenApiPaths'

export default interface OpenApi {
  openapi: string
  info: {
    title: string
    version: string
  }
  security?: {
    [definition: string]: string[]
  }[]
  paths?: undefined | OpenApiPaths
  components?: undefined | OpenApiComponents
}
