import Resolved from './Resolved'

type ResolvedMap<T extends { readonly [key: string]: unknown }> = T extends {
  readonly [key: string]: unknown
}
  ? { readonly [K in keyof T]: Resolved<T[K]> }
  : never

export default ResolvedMap
