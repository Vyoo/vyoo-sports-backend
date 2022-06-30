import { URLSearchParams } from 'url'
import type * as CF from 'cloudform-types'
import env from '^/env'
import type ServerlessConfigurationResourceDefinition from '&/serverless/config/ServerlessConfigurationResourceDefinition'
import type ServerlessConfigurationResourceOutput from '&/serverless/config/ServerlessConfigurationResourceOutput'
import ApiModel from '$/sports.lib/apps/ApiModel'
import type SharedApiGatewayResource from '$/sports.lib/apps/SharedApiGatewayResource'
import camelize from '$/sports.lib/apps/camelize'
import app from './resources.app'

const pascalCaseRx = /[_\W]+(\w|$)/g

const pascalCase = (str: string): string =>
  str.replace(pascalCaseRx, (_, letter) => letter.toUpperCase())

module.exports = app.configureServerless(({ Fn, resource }) => {
  const apiGatewayName = env.REST_API_NAME

  const httpApiName = env.HTTP_API_NAME

  const websocketApiName = env.WEBSOCKET_API_NAME

  const cognitoUserPoolName = env.COGNITO_USER_POOL_NAME!

  const cognitoUserPoolDomain = env.COGNITO_USER_POOL_DOMAIN!

  const googleIdpCustomProviderName = env.GOOGLE_IDP_CUSTOM_PROVIDER_NAME

  const googleIdpClientId = env.GOOGLE_IDP_CLIENT_ID!

  const googleIdpClientSecret = env.COGNITO_IDP_CLIENT_SECRET!

  const googleIdpAuthScopes = env.GOOGLE_IDP_AUTH_SCOPES.split(',').filter(Boolean).join(' ')

  const googleIdpAttributesRequestMethod = env.GOOGLE_IDP_ATTRIBUTES_REQUEST_METHOD

  const googleIdpIssuer = env.GOOGLE_IDP_ISSUER

  const googleIdpAttributeMapping = Object.fromEntries(
    Array.from(new URLSearchParams(env.GOOGLE_IDP_ATTRIBUTE_MAPPING).entries())
  )

  const cognitoClientName = env.COGNITO_CLIENT_NAME!

  const cognitoClientAllowedFlows = env.COGNITO_CLIENT_ALLOWED_FLOWS.split(',').filter(Boolean)

  const cognitoClientAllowedScopes = env.COGNITO_CLIENT_ALLOWED_SCOPES.split(',').filter(Boolean)

  const cognitoClientAccessTokenValidity = Number(env.COGNITO_CLIENT_ACCESS_TOKEN_VALIDITY)

  const cognitoClientIdTokenValidity = Number(env.COGNITO_CLIENT_ID_TOKEN_VALIDITY)

  const cognitoClientExplicitAuthFlows =
    env.COGNITO_CLIENT_EXPLICIT_AUTH_FLOWS.split(',').filter(Boolean)

  const cognitoClientCallbackUrls = [
    Fn.Join('', [
      'https://',
      Fn.Ref('VyooSportsApiGateway'),
      // eslint-disable-next-line no-template-curly-in-string
      '.execute-api.${aws:region}.amazonaws.com/${sls:stage}/latest/auth/complete',
    ]),
    Fn.Join('', [
      'https://',
      Fn.Ref('VyooSportsApiGateway'),
      // eslint-disable-next-line no-template-curly-in-string
      '.execute-api.${aws:region}.amazonaws.com/${sls:stage}/docs/',
    ]),
    Fn.Join('', [
      'https://',
      Fn.Ref('VyooSportsApiGateway'),
      // eslint-disable-next-line no-template-curly-in-string
      '.execute-api.${aws:region}.amazonaws.com/${sls:stage}/playground',
    ]),
    ...env.COGNITO_CLIENT_CALLBACK_URLS.split(',').filter(Boolean),
  ]

  const apiGatewayRestApiExportKey = env.API_GATEWAY_REST_API_ID_EXPORT_KEY
  const apiGatewayRestApiIdExportName = env.API_GATEWAY_REST_API_ID_EXPORT_NAME

  const apiGatewayRootResourceIdExportKey = env.API_GATEWAY_ROOT_RESOURCE_ID_EXPORT_KEY
  const apiGatewayRootResourceIdExportName = env.API_GATEWAY_ROOT_RESOURCE_ID_EXPORT_NAME

  const apiGatewayResourceExportKeyPrefix = env.API_GATEWAY_RESOURCE_EXPORT_KEY_PREFIX
  const apiGatewayResourceExportNamePrefix = env.API_GATEWAY_RESOURCE_EXPORT_NAME_PREFIX

  const apiGatewayHttpApiIdExportKey = env.API_GATEWAY_HTTP_API_ID_EXPORT_KEY
  const apiGatewayHttpApiIdExportName = env.API_GATEWAY_HTTP_API_ID_EXPORT_NAME

  const apiGatewayWebsocketApiIdExportKey = env.API_GATEWAY_WEBSOCKET_API_ID_EXPORT_KEY
  const apiGatewayWebsocketApiIdExportName = env.API_GATEWAY_WEBSOCKET_API_ID_EXPORT_NAME

  const cognitoUserPoolNameExportKey = env.COGNITO_USER_POOL_NAME_EXPORT_KEY
  const cognitoUserPoolNameExportName = env.COGNITO_USER_POOL_NAME_EXPORT_NAME

  const getSharedResources = (
    nodes: readonly SharedApiGatewayResource[],
    parent = Fn.GetAtt('VyooSportsApiGateway', 'RootResourceId')
  ): [string, ServerlessConfigurationResourceDefinition][] =>
    nodes.flatMap((node): [string, ServerlessConfigurationResourceDefinition][] => {
      const key = `VyooSportsApiGateway${pascalCase(node.path)}Resource`

      return [
        [
          key,
          resource<CF.ApiGateway.Resource>({
            Type: 'AWS::ApiGateway::Resource',
            Properties: {
              RestApiId: Fn.Ref('VyooSportsApiGateway'),
              ParentId: parent,
              PathPart: node.path,
            },
          }),
        ],
        ...getSharedResources(node.children, Fn.Ref(key)),
      ]
    })

  const sharedResources = getSharedResources(ApiModel.instance.sharedApiGatewayResources)

  const sharedResourcesOutputs = sharedResources.map(
    ([key, res]): [string, ServerlessConfigurationResourceOutput] => {
      const path = (res as unknown as CF.ApiGateway.Resource).Properties.PathPart as string

      return [
        `${apiGatewayResourceExportKeyPrefix}${pascalCase(path)}`,
        {
          Value: Fn.Ref(key),
          Export: {
            // Name: `\${opt:stage}-${apiGatewayTestResourceIdExportName}`,
            Name: `${apiGatewayResourceExportNamePrefix}${camelize(path)}`,
          },
        },
      ]
    }
  )

  return {
    service: 'vyoo-sports-backend-resources',
    provider: {
      httpApi: undefined!,
      apiGateway: undefined!,
    },
    resources: {
      Resources: {
        VyooSportsApiGateway: resource<CF.ApiGateway.RestApi>({
          Type: 'AWS::ApiGateway::RestApi',
          Properties: {
            // Name: `\${opt:stage}-${apiGatewayName}`,
            Name: apiGatewayName,
          },
        }),
        ...Object.fromEntries(sharedResources),
        // VyooSportsApiGatewayTestResource: resource<CF.ApiGateway.Resource>({
        //   Type: 'AWS::ApiGateway::Resource',
        //   Properties: {
        //     RestApiId: Fn.Ref('VyooSportsApiGateway'),
        //     ParentId: Fn.GetAtt('VyooSportsApiGateway', 'RootResourceId'),
        //     PathPart: 'test',
        //   },
        // }),
        VyooSportsHttpApi: resource<CF.ApiGatewayV2.Api>({
          Type: 'AWS::ApiGatewayV2::Api',
          Properties: {
            Name: httpApiName,
            ProtocolType: 'HTTP',
          },
        }),
        VyooSportsHttpApiStage: resource<CF.ApiGatewayV2.Stage>({
          Type: 'AWS::ApiGatewayV2::Stage',
          Properties: {
            ApiId: Fn.Ref('VyooSportsHttpApi'),
            StageName: '${sls:stage}',
            AutoDeploy: true,
          },
        }),
        VyooSportsWebsocketApi: resource<CF.ApiGatewayV2.Api>({
          Type: 'AWS::ApiGatewayV2::Api',
          Properties: {
            Name: websocketApiName,
            ProtocolType: 'WEBSOCKET',
            RouteSelectionExpression: '$request.body.action',
          },
        }),
        VyooSportsCognitoUserPool: resource<CF.Cognito.UserPool>({
          Type: 'AWS::Cognito::UserPool',
          Properties: {
            UserPoolName: cognitoUserPoolName,
            // Schema: [
            //   {
            //     Name: 'email',
            //     Required: true,
            //     Mutable: true,
            //   },
            // ],
            // Policies: {
            //   PasswordPolicy: {
            //     MinimumLength: 6,
            //   },
            // },
            // AutoVerifiedAttributes: ['email'],
          },
        }),
        VyooSportsCognitoUserPoolDomain: resource<CF.Cognito.UserPoolDomain>({
          Type: 'AWS::Cognito::UserPoolDomain',
          Properties: {
            UserPoolId: Fn.Ref('VyooSportsCognitoUserPool'),
            Domain: cognitoUserPoolDomain,
          },
        }),
        // VyooSportsGoogleCognitoUserPoolIdp: resource<CF.Cognito.UserPoolIdentityProvider>({
        //   Type: 'AWS::Cognito::UserPoolIdentityProvider',
        //   Properties: {
        //     // UserPoolId: { Ref: 'CognitoUserPool' },
        //     UserPoolId: Fn.Ref('VyooSportsCognitoUserPool'),
        //     ProviderName: 'Google',
        //     ProviderType: 'Google',
        //     ProviderDetails: {
        //       client_id: '712616210287-moki3h3i0spr3lla1hgdjteqvrf38r42.apps.googleusercontent.com',
        //       // client_secret: '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',
        //       client_secret: env.COGNITO_GOOGLE_CLIENT_SECRET!,
        //       authorize_scopes: 'https://www.googleapis.com/auth/cloud-platform',
        //     },
        //     AttributeMapping: {
        //       username: 'sub',
        //       email: 'email',
        //       email_verified: 'email_verified',
        //       phone_number: 'phoneNumbers',
        //       name: 'name',
        //       given_name: 'given_name',
        //       family_name: 'family_name',
        //       gender: 'genders',
        //       birthdate: 'birthdays',
        //       picture: 'picture',
        //     },
        //   },
        // }),
        VyooSportsGoogleCognitoUserPoolIdp: resource<CF.Cognito.UserPoolIdentityProvider>({
          Type: 'AWS::Cognito::UserPoolIdentityProvider',
          Properties: {
            // UserPoolId: { Ref: 'CognitoUserPool' },
            UserPoolId: Fn.Ref('VyooSportsCognitoUserPool'),
            ProviderName: googleIdpCustomProviderName,
            ProviderType: 'OIDC',
            ProviderDetails: {
              client_id: googleIdpClientId,
              // client_secret: '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',
              client_secret: googleIdpClientSecret,
              authorize_scopes: googleIdpAuthScopes,
              attributes_request_method: googleIdpAttributesRequestMethod,
              oidc_issuer: googleIdpIssuer,
            },
            AttributeMapping: googleIdpAttributeMapping,
          },
        }),
        VyooSportsCognitoUserPoolClient: resource<CF.Cognito.UserPoolClient>({
          Type: 'AWS::Cognito::UserPoolClient',
          Properties: {
            ClientName: cognitoClientName,
            // GenerateSecret: true,
            UserPoolId: Fn.Ref('VyooSportsCognitoUserPool'),
            SupportedIdentityProviders: [Fn.Ref('VyooSportsGoogleCognitoUserPoolIdp')],
            AllowedOAuthFlows: cognitoClientAllowedFlows,
            AllowedOAuthFlowsUserPoolClient: true,
            AllowedOAuthScopes: cognitoClientAllowedScopes,
            AccessTokenValidity: cognitoClientAccessTokenValidity,
            IdTokenValidity: cognitoClientIdTokenValidity,
            ExplicitAuthFlows: cognitoClientExplicitAuthFlows,
            CallbackURLs: cognitoClientCallbackUrls,
          },
        }),
      },
      Outputs: {
        [apiGatewayRestApiExportKey]: {
          Value: Fn.Ref('VyooSportsApiGateway'),
          Export: {
            // Name: `\${opt:stage}-${apiGatewayRestApiIdExportName}`,
            Name: apiGatewayRestApiIdExportName,
          },
        },
        [apiGatewayRootResourceIdExportKey]: {
          Value: Fn.GetAtt('VyooSportsApiGateway', 'RootResourceId'),
          Export: {
            // Name: `\${opt:stage}-${apiGatewayRootResourceIdExportName}`,
            Name: apiGatewayRootResourceIdExportName,
          },
        },
        ...Object.fromEntries(sharedResourcesOutputs),
        // [`${apiGatewayResourceExportKeyPrefix}test`]: {
        //   Value: Fn.Ref('VyooSportsApiGatewayTestResource'),
        //   Export: {
        //     // Name: `\${opt:stage}-${apiGatewayTestResourceIdExportName}`,
        //     Name: `${apiGatewayResourceExportNamePrefix}test`,
        //   },
        // },
        [apiGatewayHttpApiIdExportKey]: {
          Value: Fn.Ref('VyooSportsHttpApi'),
          Export: {
            // Name: `\${opt:stage}-${apiGatewayHttpApiIdExportName}`,
            Name: apiGatewayHttpApiIdExportName,
          },
        },
        [apiGatewayWebsocketApiIdExportKey]: {
          Value: Fn.Ref('VyooSportsWebsocketApi'),
          Export: {
            // Name: `\${opt:stage}-${apiGatewayWebsocketApiIdExportName}`,
            Name: apiGatewayWebsocketApiIdExportName,
          },
        },
        [cognitoUserPoolNameExportKey]: {
          Value: cognitoUserPoolName,
          Export: {
            // Name: `\${opt:stage}-${cognitoUserPoolNameExportName}`,
            Name: cognitoUserPoolNameExportName,
          },
        },
      },
    },
  }
})
