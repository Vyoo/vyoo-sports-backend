export default interface DefaultAllJsonSchema<L, R> {
  readonly allOf: readonly [L, R]
}
