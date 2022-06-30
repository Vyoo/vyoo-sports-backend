import path from 'path'
import { Fn } from 'cloudform-types'
import env from '^/env'
import type AppBuilder from '&/core/AppBuilder'
import type ConfigureServerless from '&/serverless/ConfigureServerless'
import ServerlessConfigurationOverrides from '&/serverless/config/ServerlessConfigurationOverrides'
import ApiModel from './ApiModel'
import type FinalExtensions from './FinalExtensions'
import type SharedApiGatewayResource from './SharedApiGatewayResource'
import camelize from './camelize'
import resource from './resource'

const decorateConfigureServerless = (configureServerless: ConfigureServerless) =>
  function decoratedConfigureServerless<This extends AppBuilder<FinalExtensions>>(
    this: This,
    configFn:
      | ServerlessConfigurationOverrides
      | ((context: {
          readonly Fn: typeof Fn
          readonly resource: typeof resource
        }) => ServerlessConfigurationOverrides)
  ) {
    const cfg = typeof configFn === 'function' ? configFn({ Fn, resource }) : configFn

    const vpcSecurityGroupIds = env.VPC_SECURITY_GROUPS!.split(',')
    const vpcSubnetIds = env.VPC_SUBNETS!.split(',')

    const apiGatewayRestApiIdExportName = env.API_GATEWAY_REST_API_ID_EXPORT_NAME
    const apiGatewayRootResourceIdExportName = env.API_GATEWAY_ROOT_RESOURCE_ID_EXPORT_NAME
    const apiGatewayResourceExportNamePrefix = env.API_GATEWAY_RESOURCE_EXPORT_NAME_PREFIX
    const apiGatewayHttpApiIdExportName = env.API_GATEWAY_HTTP_API_ID_EXPORT_NAME
    const apiGatewayWebsocketApiIdExportName = env.API_GATEWAY_WEBSOCKET_API_ID_EXPORT_NAME

    const getSharedResources = (
      nodes: readonly SharedApiGatewayResource[],
      parents: string[] = []
    ): [string, unknown][] =>
      nodes.flatMap((node): [string, unknown][] => {
        const key = [...parents, `/${node.path}`]

        const exportName = `${apiGatewayResourceExportNamePrefix}${camelize(node.path)}`

        return [
          [key.join(''), Fn.ImportValue(exportName)],
          ...getSharedResources(node.children, key),
        ]
      })

    const sharedResources = getSharedResources(ApiModel.instance.sharedApiGatewayResources)

    const overrides: ServerlessConfigurationOverrides = {
      org: env.SLS_ORG,
      app: env.SLS_APP,
      ...cfg,
      plugins: {
        localPath: Array.isArray(cfg.plugins) ? undefined! : cfg.plugins?.localPath!,
        modules: [
          'serverless-offline',
          ...(Array.isArray(cfg.plugins) ? cfg.plugins : cfg.plugins?.modules ?? []),
        ],
      },
      provider: {
        // stage: this.buildContext.stage,
        runtime: 'nodejs14.x',
        vpc: {
          securityGroupIds: vpcSecurityGroupIds,
          subnetIds: vpcSubnetIds,
        },
        httpApi: {
          // id: `${constants.sls.param.apiGatewayHttpApiId}`,
          id: Fn.ImportValue(apiGatewayHttpApiIdExportName) as any,
        },
        apiGateway: {
          // restApiId: {
          //   'Fn::ImportValue': 'VyooSportsApiGateway-restApiId',
          // },
          // restApiId: `${constants.sls.param.apiGatewayRestApiId}`,
          restApiId: Fn.ImportValue(apiGatewayRestApiIdExportName) as any,
          // restApiRootResourceId: {
          //   'Fn::ImportValue': 'VyooSportsApiGateway-rootResourceId',
          // },
          // restApiRootResourceId: `${constants.sls.param.apiGatewayRootResourceId}`,
          restApiRootResourceId: Fn.ImportValue(apiGatewayRootResourceIdExportName) as any,
          // websocketApiId: {
          //   'Fn::ImportValue': 'VyooSportsApiGateway-websocketApiId',
          // },
          // websocketApiId: `${constants.sls.param.apiGatewayWebsocketApiId}`,
          websocketApiId: Fn.ImportValue(apiGatewayWebsocketApiIdExportName) as any,
          // restApiResources: {
          //   // '/test': `${constants.sls.param.apiGatewayTestResourceId}`,
          //   '/test': Fn.ImportValue(`${env.API_GATEWAY_RESOURCE_EXPORT_NAME_PREFIX}test`),
          // },
          restApiResources: Object.fromEntries(sharedResources),
        },
        ...cfg.provider,
        iam: {
          role: {
            managedPolicies: ['arn:aws:iam::aws:policy/AdministratorAccess'],
          },
          ...cfg.provider?.iam,
        },
        environment: {
          NODE_OPTIONS:
            '--stack-trace-limit=1000 --enable-source-maps -r source-map-support/register',
          ...cfg.provider?.environment,
        },
      },
      custom: {
        ...cfg.custom,
        esbuild: {
          ...(cfg.custom?.esbuild as {}),
          // packager: 'yarn',
          packagePath: path.join(__dirname, '..', '..', '..', 'package.json'),
          // external: ['source-map-support'],
          minify: false,
          sourcemap: true,
          plugins: path.relative(process.cwd(), path.join(__dirname, '..', 'esbuildPlugins.ts')),
        },
      },
    }

    const result = configureServerless.call(this, overrides)

    // console.log(`config for ${cfg.service}: ${JSON.stringify(result, null, 2)}`)

    return result
  }

export default decorateConfigureServerless
