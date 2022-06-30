import Resolved from './Resolved'

type ResolvedList<T extends readonly unknown[]> = T extends readonly unknown[]
  ? { readonly [K in keyof T]: Resolved<T[K]> }
  : never

export default ResolvedList
