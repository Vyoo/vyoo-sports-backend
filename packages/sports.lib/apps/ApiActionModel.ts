import path from 'path'
import type HttpAction from '&/http/actions/HttpAction'
import isHttpAction from '&/http/actions/isHttpAction'
import type AppModel from './AppModel'
import camelize from './camelize'

const rx = /^(?<path>.+?)\.(?<methods>\w+?(,\w+?)?)(\.\[(?<ver>.+?)(@(?<sub>.+?))?])?\.ts$/

export default class ApiActionModel {
  static create(filePath: string): ApiActionModel {
    const fileName = path.basename(filePath)

    const match = rx.exec(fileName)

    if (match?.groups) {
      const { ver, sub, methods } = match.groups

      if (
        ver ||
        fileName === 'v.{version}.{path+}.any.ts' ||
        fileName === 'docs.get.ts' ||
        fileName === 'docs.{version}.get.ts' ||
        fileName === 'playground.get.ts'
      ) {
        return new ApiActionModel(
          filePath,
          ver || undefined,
          sub || undefined,
          methods,
          match.groups.path
        )
      }
    }

    throw new Error(
      `Incorrect format of the action file name: ${fileName} in ${path.dirname(filePath)}`
    )
  }

  readonly namingRoot = path.join(__dirname, '..', '..')

  readonly appDirRelativeToFilePath = '..'

  get methods(): string[] {
    if (this._methods === undefined) {
      this._methods = this.methodPart.split(',')
    }

    return this._methods
  }

  get path(): string {
    if (this._path === undefined) {
      return this.pathPart.replace(/\./g, '/') // .replace(/\{(.+?)\^}/g, `{$1?}`)
    }

    return this._path
  }

  get handler(): [string, string] {
    if (this._handler === undefined) {
      this._handler = [this.filePath, 'default']
    }

    return this._handler
  }

  get name(): string {
    if (this._name === undefined) {
      const prefix = path.relative(
        this.namingRoot,
        path.join(path.dirname(this.filePath), this.appDirRelativeToFilePath)
      )

      const parts = [prefix, this.path, this.methodPart, this.ver, this.sub]

      this._name = camelize(parts.filter(Boolean).join(':'))
    }

    return this._name
  }

  get key(): string {
    if (this._key === undefined) {
      this._key = camelize(path.basename(this.filePath))
    }

    return this._key
  }

  get action(): HttpAction {
    if (this._action === undefined) {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      this._action = require(this.filePath).default

      if (!isHttpAction(this._action)) {
        throw new Error(`${this.filePath} is not a valid HTTP action`)
      }
    }

    return this._action
  }

  constructor(
    readonly filePath: string,
    readonly ver: undefined | string,
    readonly sub: undefined | string,
    readonly methodPart: string,
    readonly pathPart: string
  ) {}

  belongsTo(app: AppModel): boolean {
    return path.join(path.dirname(this.filePath), this.appDirRelativeToFilePath) === app.dir
  }

  _methods?: string[]

  _path?: string

  _handler?: [string, string]

  _name?: string

  _key?: string

  _action?: HttpAction
}
