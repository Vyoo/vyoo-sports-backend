export default interface SharedApiGatewayResource {
  readonly path: string

  readonly children: readonly SharedApiGatewayResource[]
}
