import OpenApiContent from './OpenApiContent'

export default interface OpenApiRequestBody {
  description?: undefined | string
  content?: undefined | OpenApiContent
}
