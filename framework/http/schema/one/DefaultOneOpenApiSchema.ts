export default interface DefaultOneOpenApiSchema<L, R> {
  readonly oneOf: readonly [L, R]
}
