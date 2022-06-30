export default interface DefaultOneJsonSchema<L, R> {
  readonly oneOf: readonly [L, R]
}
