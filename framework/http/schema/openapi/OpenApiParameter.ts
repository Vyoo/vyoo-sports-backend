import type OpenApiHeader from './OpenApiHeader'
import type OpenApiParameterLocation from './OpenApiParameterLocation'

export default interface OpenApiParameter extends OpenApiHeader {
  name: string
  in: OpenApiParameterLocation
}
