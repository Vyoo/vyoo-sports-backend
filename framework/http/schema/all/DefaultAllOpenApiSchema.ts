export default interface DefaultAllOpenApiSchema<L, R> {
  readonly allOf: readonly [L, R]
}
