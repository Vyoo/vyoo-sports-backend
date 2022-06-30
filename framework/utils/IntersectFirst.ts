type IntersectFirst<T extends readonly unknown[], E> = T extends readonly []
  ? []
  : T extends [infer Head, ...infer Tail]
  ? [Head & E, ...Tail]
  : T

export default IntersectFirst
