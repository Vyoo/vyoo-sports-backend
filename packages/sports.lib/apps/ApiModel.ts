import fs from 'fs'
import path from 'path'
import ApiActionModel from './ApiActionModel'
import ApiRouteModel from './ApiRouteModel'
import ApiVersionModel from './ApiVersionModel'
import AppModel from './AppModel'
import type SharedApiGatewayResource from './SharedApiGatewayResource'

export default class ApiModel {
  static readonly instance = new ApiModel()

  readonly packagesDir = path.join(__dirname, '..', '..')

  get apps(): AppModel[] {
    if (this._apps === undefined) {
      this._apps = fs
        .readdirSync(this.packagesDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name.endsWith('.app'))
        .map(entry => {
          const dir = path.join(this.packagesDir, entry.name)

          const appFilePath = path.join(dir, `${entry.name}.ts`)

          if (!fs.existsSync(appFilePath)) {
            throw new Error(`Missing ${entry.name}.ts file in the app directory ${dir}`)
          }

          const slsFilePath = path.join(
            dir,
            `${entry.name.substr(0, entry.name.length - 4)}.sls.ts`
          )

          return new AppModel(dir, appFilePath, fs.existsSync(slsFilePath) ? slsFilePath : null)
        })
        .filter(x => fs.existsSync(x.appFilePath))
    }

    return this._apps
  }

  get actions(): ApiActionModel[] {
    if (this._actions === undefined) {
      this._actions = this.apps.flatMap(app => app.actions)
    }

    return this._actions
  }

  get versions(): ApiVersionModel[] {
    if (this._versions === undefined) {
      const vers: string[] = []
      const subs: string[] = []

      const { actions } = this

      actions.forEach(action => {
        if (action.ver) {
          if (!vers.includes(action.ver)) {
            vers.push(action.ver)
          }

          if (action.sub) {
            if (!subs.includes(action.sub)) {
              subs.push(action.sub)
            }
          }
        }
      })

      vers.sort()
      subs.sort()

      const mergePaths = (
        prev:
          | undefined
          | {
              level: string
              path: string
              actions: ApiActionModel[]
            }[],
        verActions: ApiActionModel[],
        subActions?: undefined | ApiActionModel[]
      ): {
        level: string
        path: string
        actions: ApiActionModel[]
      }[] => {
        const result = prev?.map(item => ({ ...item, level: 'prev' })) ?? []

        const sources = [
          [verActions, 'ver'],
          [subActions, 'sub'],
        ] as const

        sources.forEach(([sourceActions, level]) => {
          sourceActions?.forEach(action => {
            const index = result.findIndex(x => x.path === action.path)
            const existing = index < 0 ? undefined : result[index]

            if (existing === undefined || existing.level !== level) {
              if (index >= 0) {
                result.splice(index, 1)
              }

              result.push({ level, path: action.path, actions: [action] })
            } else {
              existing.actions.push(action)
            }
          })
        })

        return result
      }

      let prev:
        | undefined
        | {
            ver: string
            sub: undefined
            paths: {
              level: string
              path: string
              actions: ApiActionModel[]
            }[]
            model: ApiVersionModel
            subs?:
              | undefined
              | {
                  ver: string
                  sub: string
                  paths: {
                    level: string
                    path: string
                    actions: ApiActionModel[]
                  }[]
                  model: ApiVersionModel
                }[]
          }

      const items = vers.map(ver => {
        const versionActions = actions.filter(x => x.ver === ver)

        const verActions = versionActions.filter(x => !x.sub)

        const subItems = subs.map(sub => {
          const subActions = verActions.filter(x => x.sub === sub)

          const previousSub = prev?.subs?.find(x => x.sub === sub)

          const paths = mergePaths(previousSub?.paths, verActions, subActions)

          return {
            ver,
            sub,
            paths,
            model: new ApiVersionModel(
              ver,
              sub,
              paths.flatMap($path =>
                $path.actions
                  .flatMap(action => action.methods)
                  .filter((v, i, a) => i === a.indexOf(v))
                  .map(
                    method =>
                      new ApiRouteModel(
                        method,
                        $path.path,
                        $path.actions.filter(action => action.methods.includes(method))
                      )
                  )
              )
            ),
          }
        })

        const paths = mergePaths(prev?.paths, verActions)

        prev = {
          ver,
          sub: undefined,
          paths,
          model: new ApiVersionModel(
            ver,
            undefined,
            paths.flatMap($path =>
              $path.actions
                .flatMap(action => action.methods)
                .filter((v, i, a) => i === a.indexOf(v))
                .map(
                  method =>
                    new ApiRouteModel(
                      method,
                      $path.path,
                      $path.actions.filter(action => action.methods.includes(method))
                    )
                )
            ),
            subItems.map(subItem => subItem.model)
          ),
          subs: subItems,
        }

        return prev
      })

      if (prev) {
        const subItems = prev.subs!.map(subItem => ({
          ver: 'latest',
          sub: subItem.sub,
          paths: subItem.paths,
          model: new ApiVersionModel('latest', subItem.sub, subItem.model.routes),
        }))

        items.push({
          ver: 'latest',
          sub: undefined,
          paths: prev.paths,
          subs: subItems,
          model: new ApiVersionModel(
            'latest',
            undefined,
            prev.model.routes,
            subItems.map(subItem => subItem.model)
          ),
        })
      }

      this._versions = items.map(item => item.model)
    }

    return this._versions
  }

  get sharedApiGatewayResources(): SharedApiGatewayResource[] {
    if (this._sharedApiGatewayResources === undefined) {
      interface TreeNode {
        part: string
        apps: AppModel[]
        children: TreeNode[]
      }

      const tree: TreeNode[] = []

      this.apps.forEach(app => {
        app.buildRoutes(this.versions).forEach(version => {
          version.routes.forEach(route => {
            let nodes = tree

            route.path.split('/').forEach(part => {
              let node = nodes.find(x => x.part === part)

              if (node === undefined) {
                node = { part, apps: [app], children: [] }
                nodes.push(node)
              } else if (!node.apps.includes(app)) {
                node.apps.push(app)
              }

              nodes = node.children
            })
          })
        })
      })

      const processNodes = (nodes: TreeNode[]): SharedApiGatewayResource[] =>
        nodes
          .filter(node => node.apps.length > 1)
          .map(node => ({
            path: node.part,
            children: processNodes(node.children),
          }))

      this._sharedApiGatewayResources = processNodes(tree)
    }

    return this._sharedApiGatewayResources
  }

  _apps?: AppModel[]

  _actions?: ApiActionModel[]

  _versions?: ApiVersionModel[]

  _sharedApiGatewayResources?: SharedApiGatewayResource[]
}
