import path from 'path'
import { sls } from './const'

type Param = typeof sls.param

const defaultParams = [
  // sls.param.apiGatewayRestApiId,
  // sls.param.apiGatewayRootResourceId,
  // sls.param.apiGatewayHttpApiId,
  // sls.param.apiGatewayWebsocketApiId,
] as const

const services = <
  T extends {
    [name: string]: {
      params?: Param[keyof Param][]
      dependsOn?: undefined | string | string[]
    }
  }
>(
  map: T
) => {
  const result = Object.fromEntries(
    Object.entries(map).map(([name, options]) => {
      const filename = path.relative(__dirname, require.resolve(`$/${name}.app/${name}.sls`))

      const params = options?.params || defaultParams

      return [
        name,
        {
          path: path.dirname(filename),
          config: path.basename(filename),
          params: Object.fromEntries(
            params.map(param => [param.name, `\${${param.source}}`])
          ) as Partial<Param>,
          dependsOn: 'dependsOn' in options ? options.dependsOn : ['resources'],
        },
      ]
    })
  )

  return result as {
    [K in keyof T]: {
      path: string
      config: string
      params: Partial<Param>
      dependsOn?: undefined | string | string[]
    }
  }
}

module.exports = {
  services: services({
    resources: {
      params: [],
      dependsOn: undefined,
    },
    playground: {},
    sports: {
      params: [...defaultParams, sls.param.cognitoUserPoolName],
    },
    soccer: {},
  }),
}

// module.exports = {
//   services: {
//     resources: {
//       path: 'packages/resources.app',
//       config: 'resources.sls.ts',
//     },
//     soccer: {
//       path: 'packages/soccer.app',
//       config: 'soccer.sls.ts',
//     },
//     // playground: {
//     //   path: 'packages/playground.app',
//     //   config: 'playground.sls.ts',
//     //   params: {
//     //     apiGatewayRestApiId: '${resources.apiGatewayRestApiId}',
//     //   },
//     // },
//   },
// }

// console.log(JSON.stringify(module.exports, null, 2))
