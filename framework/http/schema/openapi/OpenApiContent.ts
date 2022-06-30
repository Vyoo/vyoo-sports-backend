import type OpenApiContentItem from './OpenApiContentItem'

export default interface OpenApiContent {
  [contentType: string]: OpenApiContentItem
}
