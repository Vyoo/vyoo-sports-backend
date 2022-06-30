import { URL } from 'url'
// eslint-disable-next-line import/no-extraneous-dependencies
import { CognitoIdentityServiceProvider } from 'aws-sdk'
import type {
  UserPoolClientType,
  UserPoolType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider'
import configure from '&/config/configure'
import inject from '&/di/inject'
import Log from '&/logging/Log'
import isInServerlessBuildContext from '&/serverless/isInServerlessBuildContext'
import isInServerlessOfflineContext from '&/serverless/isInServerlessOfflineContext'

export default class CognitoService {
  userPoolCache: {
    name: string
    id?: string
    desc?: UserPoolType
  }[] = []

  clientCache: {
    userPoolId: string
    name: string
    id?: string
    desc?: UserPoolClientType
  }[] = []

  constructor(
    readonly log = inject(Log),
    readonly config = configure(({ env }) => ({
      defaultUserPoolName: env.COGNITO_USER_POOL_NAME,
      defaultUserPoolId:
        env.COGNITO_USER_POOL_ID ||
        (isInServerlessBuildContext() && !isInServerlessOfflineContext()
          ? '${param:cognitoUserPoolId}'
          : undefined),
      defaultFrontendClientName: env.COGNITO_CLIENT_NAME,
      defaultFrontendClientId:
        env.COGNITO_CLIENT_ID ||
        (isInServerlessBuildContext() && !isInServerlessOfflineContext()
          ? '${param:cognitoFrontendClientId}'
          : undefined),
    })),
    readonly cognitoIdentityServiceProvider = inject(CognitoIdentityServiceProvider)
  ) {}

  async getUserPoolIdByName(name?: undefined | string): Promise<string> {
    this.log.debug(`getUserPoolIdByName()`, name)

    if (name === undefined) {
      // eslint-disable-next-line no-param-reassign
      name = this.config.defaultUserPoolName

      if (!name) {
        throw new Error(`Missing COGNITO_USER_POOL_NAME env var`)
      }
    }

    const cached = this.userPoolCache.find(x => x.name === name)?.id

    if (cached) {
      return cached
    }

    for (let nextToken: undefined | null | string; nextToken !== null; ) {
      const res = await this.cognitoIdentityServiceProvider
        .listUserPools({
          MaxResults: 60,
          NextToken: nextToken!,
        })
        .promise()

      if (res.UserPools) {
        for (const each of res.UserPools) {
          if (each.Name === name && each.Id) {
            this.log.debug(`getUserPoolIdByName()`, name, `~>`, each.Id)

            const cacheEntry = this.userPoolCache.find(x => x.name === each.Name)

            if (cacheEntry) {
              if (cacheEntry.id !== each.Id) {
                cacheEntry.id = each.Id
                delete cacheEntry.desc
              }
            } else {
              this.userPoolCache.push({ name: each.Name!, id: each.Id! })
            }

            return each.Id
          }
        }
      }

      nextToken = res.NextToken || null
    }

    throw new Error(`Could not find user pool named "${name}"`)
  }

  async describeUserPool(id?: undefined | string): Promise<UserPoolType> {
    this.log.debug(`describeUserPool()`, id)

    if (id === undefined) {
      // eslint-disable-next-line no-param-reassign
      id = this.config.defaultUserPoolId || (await this.getUserPoolIdByName())
    }

    const cached = this.userPoolCache.find(x => x.id === id)?.desc

    if (cached) {
      return cached
    }

    const res = await this.cognitoIdentityServiceProvider
      .describeUserPool({
        UserPoolId: id,
      })
      .promise()

    if (!res.UserPool) {
      throw new Error(`Could not find user pool ${id}`)
    }

    this.log.debug(`describeUserPool()`, id, `~>`, res.UserPool)

    const cacheEntry = this.userPoolCache.find(x => x.id === res.UserPool!.Id!)

    if (cacheEntry) {
      cacheEntry.desc = res.UserPool
    } else {
      this.userPoolCache.push({
        name: res.UserPool.Name!,
        id: res.UserPool.Id!,
        desc: res.UserPool,
      })
    }

    return res.UserPool
  }

  parseCognitoUserPoolArn(arn: string): {
    region: string
    accountId: number
    name: string
  } {
    const parts = arn.split(':')

    if (
      parts.length !== 6 ||
      parts[0] !== 'arn' ||
      parts[1] !== 'aws' ||
      parts[2] !== 'cognito-idp' ||
      !Number(parts[4])
    ) {
      throw new Error(`Invalid Cognito User Pool ARN: ${arn}`)
    }

    const parts2 = parts[5].split('/')

    if (parts2.length !== 2 || parts2[0] !== 'userpool') {
      throw new Error(`Invalid Cognito User Pool ARN: ${arn}`)
    }

    return {
      region: parts[3],
      accountId: Number(parts[4]),
      name: parts2[1],
    }
  }

  async getUserPoolClientIdByName(
    userPoolId?: undefined | string,
    name?: undefined | string
  ): Promise<string> {
    this.log.debug(`getUserPoolClientIdByName()`, userPoolId, name)

    if (userPoolId === undefined) {
      // eslint-disable-next-line no-param-reassign
      userPoolId = await this.getUserPoolIdByName()
    }

    if (name === undefined) {
      // eslint-disable-next-line no-param-reassign
      name = this.config.defaultFrontendClientName

      if (!name) {
        throw new Error(`Missing COGNITO_CLIENT_NAME env var`)
      }
    }

    const cached = this.clientCache.find(x => x.userPoolId === userPoolId && x.name === name)?.id

    if (cached) {
      return cached
    }

    for (let nextToken: undefined | null | string; nextToken !== null; ) {
      const res = await this.cognitoIdentityServiceProvider
        .listUserPoolClients({
          UserPoolId: userPoolId,
          NextToken: nextToken!,
        })
        .promise()

      if (res.UserPoolClients) {
        for (const each of res.UserPoolClients) {
          if (each.ClientName === name && each.ClientId) {
            this.log.debug(`getUserPoolClientIdByName()`, userPoolId, name, `~>`, each.ClientId)

            const cacheEntry = this.clientCache.find(
              x => x.userPoolId === userPoolId && x.name === each.ClientName
            )

            if (cacheEntry) {
              if (cacheEntry.id !== each.ClientId) {
                cacheEntry.id = each.ClientId
                delete cacheEntry.desc
              }
            } else {
              this.clientCache.push({
                userPoolId,
                name: each.ClientName!,
                id: each.ClientId!,
              })
            }

            return each.ClientId
          }
        }
      }

      nextToken = res.NextToken || null
    }

    throw new Error(`Could not find user pool named "${name}"`)
  }

  async describeUserPoolClient(
    userPoolId?: undefined | string,
    clientId?: undefined | string
  ): Promise<UserPoolClientType> {
    this.log.debug(`describeUserPoolClient()`, userPoolId, clientId)

    if (userPoolId === undefined) {
      // eslint-disable-next-line no-param-reassign
      userPoolId = this.config.defaultUserPoolId || (await this.getUserPoolIdByName())
    }

    if (clientId === undefined) {
      // eslint-disable-next-line no-param-reassign
      clientId = this.config.defaultFrontendClientId || (await this.getUserPoolClientIdByName())
    }

    const cached = this.clientCache.find(
      x => x.userPoolId === userPoolId && x.id === clientId
    )?.desc

    if (cached) {
      return cached
    }

    const res = await this.cognitoIdentityServiceProvider
      .describeUserPoolClient({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })
      .promise()

    if (!res.UserPoolClient) {
      throw new Error(`Could not find user pool client ${clientId} in user pool ${userPoolId}`)
    }

    this.log.debug(`describeUserPoolClient()`, userPoolId, clientId, `~>`, res.UserPoolClient)

    const cacheEntry = this.clientCache.find(
      x => x.userPoolId === res.UserPoolClient!.UserPoolId && x.id === res.UserPoolClient!.ClientId!
    )

    if (cacheEntry) {
      cacheEntry.desc = res.UserPoolClient!
    } else {
      this.clientCache.push({
        userPoolId: res.UserPoolClient!.UserPoolId!,
        id: res.UserPoolClient!.ClientId!,
        name: res.UserPoolClient!.ClientName!,
        desc: res.UserPoolClient!,
      })
    }

    return res.UserPoolClient
  }

  async getScopes(): Promise<string[]> {
    const client = await this.describeUserPoolClient()

    return client.AllowedOAuthScopes!
  }

  async getAuthorizationUrl(): Promise<string> {
    const userPool = await this.describeUserPool()

    const { region } = this.parseCognitoUserPoolArn(userPool.Arn!)
    const domain = userPool.Domain!

    return `https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize`
  }

  async getTokenUrl(): Promise<string> {
    const userPool = await this.describeUserPool()

    const { region } = this.parseCognitoUserPoolArn(userPool.Arn!)
    const domain = userPool.Domain!

    return `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`
  }

  async getOpenIdConfigurationUrl(): Promise<string> {
    const userPool = await this.describeUserPool()

    const { region } = this.parseCognitoUserPoolArn(userPool.Arn!)

    return `https://cognito-idp.${region}.amazonaws.com/${userPool.Id}/.well-known/openid-configuration`
  }

  async getAuthenticationFlowInfo(
    userPoolName?: undefined | string,
    clientName?: undefined | string
  ): Promise<{
    poolId: string
    url: string
    clientId: string
    clientSecret: undefined | string
    authHeader: undefined | string
  }> {
    this.log.debug(`getAuthenticationFlowInfo()`, userPoolName, clientName)

    const userPoolId = await this.getUserPoolIdByName(userPoolName)
    const userPool = await this.describeUserPool(userPoolId)

    const clientId = await this.getUserPoolClientIdByName(userPoolId, clientName)
    const client = await this.describeUserPoolClient(userPoolId, clientId)

    const { region } = this.parseCognitoUserPoolArn(userPool.Arn!)
    const domain = userPool.Domain!

    const clientSecret = client.ClientSecret

    const result: Awaited<ReturnType<CognitoService['getAuthenticationFlowInfo']>> = {
      poolId: userPoolId,
      url: `https://${domain}.auth.${region}.amazoncognito.com`,
      clientId,
      clientSecret,
      authHeader: clientSecret
        ? `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        : undefined,
    }

    this.log.debug(`getAuthenticationFlowInfo()`, userPoolName, clientName, `~>`, result)

    return result
  }

  async getTokenRequestObject(
    code: string,
    redirectUri: string
  ): Promise<{
    method: 'POST'
    uri: string
    headers: {
      Authorization: string
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    body: string
  }> {
    const info = await this.getAuthenticationFlowInfo()

    const url = new URL(info.url)
    url.pathname = '/oauth2/token'

    const headers = Object.fromEntries(
      Object.entries({
        // Accept: 'application/json',
        Authorization: info.authHeader!,
        'Content-Type': 'application/x-www-form-urlencoded',
      }).filter(x => x[1] !== undefined)
    ) as any

    const redirectUrl = new URL(redirectUri)
    redirectUrl.search = ''
    redirectUrl.hash = ''

    // eslint-disable-next-line no-param-reassign
    redirectUri = redirectUrl.toString()

    while (redirectUri.endsWith('/')) {
      // eslint-disable-next-line no-param-reassign
      redirectUri = redirectUri.substr(0, redirectUri.length - 1)
    }

    const params = {
      // redirect_uri: `http://localhost:3000/dev/auth/complete`,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      client_id: info.clientId,
      // client_secret: clientSecret,
      // scope:
      code,
      // code_verifier
    }

    return {
      method: 'POST',
      uri: url.toString(),
      headers,
      body: new URLSearchParams(params).toString(),
    }
  }

  async getLoginUrl(
    redirectUri: string | URL,
    state?: string,
    userPoolName?: undefined | string,
    clientName?: undefined | string
  ): Promise<URL> {
    this.log.debug(`getLoginUrl()`, userPoolName, clientName)

    const userPoolId = await this.getUserPoolIdByName(userPoolName)
    const userPool = await this.describeUserPool(userPoolId)

    const clientId = await this.getUserPoolClientIdByName(userPoolId, clientName)
    const client = await this.describeUserPoolClient(userPoolId, clientId)

    const { region } = this.parseCognitoUserPoolArn(userPool.Arn!)
    const domain = userPool.Domain!

    const url = new URL(`https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize`)

    url.searchParams.set('client_id', clientId)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', client.AllowedOAuthScopes?.join(' ') ?? '')
    url.searchParams.set('redirect_uri', redirectUri.toString())

    if (state) {
      url.searchParams.set('state', state)
    }

    return url
  }
}
