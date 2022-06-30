// eslint-disable-next-line import/no-import-module-exports
import env from '^/env'

const vpcSecurityGroupIds = env.VPC_SECURITY_GROUPS!.split(',')
const vpcSubnetIds = env.VPC_SUBNETS!.split(',')

// eslint-disable-next-line import/no-commonjs
module.exports = {
  plugins: ['serverless-step-functions'],
  org: env.SLS_ORG,
  app: env.SLS_APP,
  service: 'vyoo-sports-neptune-to-opensearch',
  provider: {
    name: 'aws',
    region: 'eu-west-3',
    runtime: 'nodejs14.x',
    vpc: {
      securityGroupIds: vpcSecurityGroupIds,
      subnetIds: vpcSubnetIds,
    },
    iam: {
      role: {
        managedPolicies: ['arn:aws:iam::aws:policy/AdministratorAccess'],
      },
    },
    environment: {
      NODE_OPTIONS: '--stack-trace-limit=1000 --enable-source-maps',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    poll: {
      handler: 'poll.default',
      environment: {
        NEPTUNE_READER_ADDRESS: env.NEPTUNE_READER_ADDRESS,
        OPENSEARCH_ENDPOINT: env.OPENSEARCH_ENDPOINT,
      },
    },
  },
  stepFunctions: {
    stateMachines: {
      NeptuneToCloudSearch: {
        definition: {
          Comment: 'Exports Neptune streams to CloudSearch service',
          StartAt: 'Init',
          States: {
            Init: {
              Type: 'Task',
              Resource: { 'Fn::GetAtt': ['poll', 'Arn'] },
              Next: 'Wait',
            },
            Wait: {
              Type: 'Pass',
              End: true,
            },
          },
        },
      },
    },
  },
}
