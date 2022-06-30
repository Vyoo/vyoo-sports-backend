import fs from 'fs'
import path from 'path'
import type App from '&/core/App'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import type BuildAppContext from '&/core/BuildAppContext'
import HttpModel from '&/http/HttpModel'
import type OpenApi from '&/http/schema/openapi/OpenApi'
import type OpenApiComponents from '&/http/schema/openapi/OpenApiComponents'
import type OpenApiParameter from '&/http/schema/openapi/OpenApiParameter'
import type OpenApiPath from '&/http/schema/openapi/OpenApiPath'
import type OpenApiRef from '&/http/schema/openapi/OpenApiRef'
import type OpenApiSchema from '&/http/schema/openapi/OpenApiSchema'
import type OpenApiSecurityScheme from '&/http/schema/openapi/OpenApiSecurityScheme'
import isInServerlessContext from '&/serverless/isInServerlessContext'
import ApiModel from '$/sports.lib/apps/ApiModel'
import type ApiVersionModel from '$/sports.lib/apps/ApiVersionModel'
import type Specs from './Specs'

const specsPath = path.join(__dirname, 'assets', 'specs.json')

export default class SportsAppPlugin extends AppBuilderPluginBase<{}, {}> {
  buildApp(context: BuildAppContext<{}>): App {
    const app = context.next()

    if (!isInServerlessContext()) {
      this.buildSpecs()
    }

    return app
  }

  buildSpecs(): void {
    const apiModel = ApiModel.instance

    const specs: Specs = apiModel.versions.map(version => {
      const spec = this.buildSpec(version)
      return { version: version.string, spec }
    })

    const json = JSON.stringify(specs, null, 2)

    fs.writeFileSync(specsPath, json, { encoding: 'utf8' })
  }

  buildSpec(version: ApiVersionModel): OpenApi {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Vyoo Sports',
        version: version.string,
      },
      security: [
        {
          openid: [],
        },
      ],
      paths: {} as Record<
        string,
        Omit<OpenApiPath, 'parameters'> & {
          parameters: (Omit<OpenApiParameter, 'schema'> & {
            schema: {
              allOf: (OpenApiRef | OpenApiSchema)[]
            }
          })[]
        }
      >,
      components: {
        securitySchemes: {
          openid: {
            type: 'openIdConnect',
          } as OpenApiSecurityScheme,
        },
      } as OpenApiComponents,
    }

    const apiModel = ApiModel.instance

    apiModel.apps.forEach(appModel => {
      const { app } = appModel

      const appHttpModel = app?.services?.getOptionalService(HttpModel)

      if (appHttpModel) {
        const { paths, components } = appHttpModel.getOpenApiSpec()

        if (paths) {
          Object.entries(paths).forEach(([key, value]) => {
            if ('$ref' in value) {
              // eslint-disable-next-line no-console
              console.warn(`[${key}] $ref path components are not supported`)
              return
            }

            if (!key.startsWith(`/${version.string}/`)) {
              return
            }

            const entry = spec.paths[key]

            const transformParameters = (source: undefined | (OpenApiRef | OpenApiParameter)[]) =>
              source
                ?.map(parameter => {
                  if ('$ref' in parameter) {
                    // eslint-disable-next-line no-console
                    console.warn(`[GET /docs] $ref path parameters are not supported`)
                    return undefined!
                  }

                  return {
                    ...parameter,
                    schema: {
                      allOf: [parameter.schema],
                    },
                  }
                })
                .filter(Boolean)

            if (entry) {
              const { parameters, ...rest } = value

              Object.assign(entry, rest)

              transformParameters(parameters)?.forEach(parameter => {
                const existing = entry.parameters?.find(
                  x => x.in === parameter.in && x.name === parameter.name
                )

                if (existing) {
                  const { schema, ...rest2 } = parameter

                  Object.assign(existing, rest2)

                  existing.schema.allOf.push(...schema.allOf)
                } else {
                  entry.parameters.push(parameter)
                }
              })
            } else {
              spec.paths[key] = {
                ...value,
                parameters: transformParameters(value.parameters) ?? [],
              }
            }
          })
        }

        if (components) {
          Object.entries(components).forEach(([key, value]) => {
            const entry = spec.components[key as keyof typeof components]

            if (entry) {
              Object.assign(entry, value)
            } else {
              spec.components[key as keyof typeof components] = value
            }
          })
        }
      }
    })

    return spec
  }
}
