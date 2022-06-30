import type AppBuilder from '&/core/AppBuilder'
import type ConfigureServerless from './ConfigureServerless'
import ServerlessFunctionEnvironmentProvider from './ServerlessFunctionEnvironmentProvider'
import ServerlessModel from './ServerlessModel'
import type ServerlessConfiguration from './config/ServerlessConfiguration'
import type ServerlessConfigurationOverrides from './config/ServerlessConfigurationOverrides'

const configure: ConfigureServerless = function configureServerless(
  this: AppBuilder<{}>,
  overrides?: undefined | ServerlessConfigurationOverrides
): ServerlessConfiguration {
  process.env.IN_SERVERLESS_BUILD_CONTEXT = 'true'

  try {
    // const resolutionRoot = process.cwd()
    const resolutionRoot = '.'

    const appInstance = this.getApp({
      build: {
        skipValidation: false,
      },
    })

    const serverlessModel = appInstance.services.getRequiredService(ServerlessModel)

    const environmentProvider = appInstance.services.getOptionalService(
      ServerlessFunctionEnvironmentProvider
    )

    const { functions } = serverlessModel.buildServerlessConfiguration({
      resolutionRoot,
      environmentProvider,
    })

    const result = { ...overrides } as ServerlessConfiguration

    result.frameworkVersion = result.frameworkVersion ?? '3'

    result.plugins = {
      localPath: Array.isArray(result.plugins) ? undefined! : result.plugins?.localPath!,
      modules: [
        'serverless-esbuild',
        ...(Array.isArray(result.plugins) ? result.plugins : result.plugins?.modules ?? []),
      ],
    }

    result.provider = { ...result.provider }
    result.provider.name = result.provider.name ?? 'aws'

    result.provider.apiGateway = {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      ...result.provider.apiGateway,
    }

    result.provider.environment = {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      ...result.provider.environment,
    }

    result.functions = {
      ...functions,
      ...result.functions,
    }

    result.package = {
      individually: true,
      ...result.package,
    }

    result.custom = {
      ...result.custom,
      esbuild: {
        bundle: true,
        minify: true,
        sourcemap: false,
        exclude: ['aws-sdk', 'pg-native'],
        target: 'node14',
        define: { 'require.resolve': undefined },
        platform: 'node',
        concurrency: 10,
        // plugins: require.resolve('./esbuild/plugins'),
        // plugins: path.relative(resolutionRoot, path.join(__dirname, 'esbuild-plugins.ts')),
        // keepOutputDirectory: true,
        ...(result.custom?.esbuild as undefined | {}),
      },
    }

    return result
  } finally {
    delete process.env.IN_SERVERLESS_BUILD_CONTEXT
  }
}

export default configure
