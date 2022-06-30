const slsParams = <T extends Record<string, string>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      {
        name: key,
        source: value,
        toString() {
          return `\${param:${key}}`
        },
      },
    ])
  ) as {
    [K in keyof T & string]: {
      name: K
      source: T[K]
      toString(): `\${param:${K}}`
    }
  }

export const sls = {
  param: slsParams({
    // apiGatewayRestApiId: 'resources.apiGatewayRestApiId',
    // apiGatewayRootResourceId: 'resources.apiGatewayRootResourceId',
    // apiGatewayHttpApiId: 'resources.apiGatewayHttpApiId',
    // apiGatewayWebsocketApiId: 'resources.apiGatewayWebsocketApiId',
    cognitoUserPoolName: 'resources.cognitoUserPoolName',
  } as const),
} as const
