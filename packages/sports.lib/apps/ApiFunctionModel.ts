import path from 'path'
import type ServerlessFunc from '&/serverless/funcs/ServerlessFunc'
import isServerlessFunc from '&/serverless/funcs/isServerlessFunc'
import camelize from './camelize'
import posix from './posix'

export default class ApiFunctionModel {
  static create(filePath: string): ApiFunctionModel {
    const fileName = path.basename(filePath)

    if (fileName.endsWith('.ts')) {
      return new ApiFunctionModel(filePath)
    }

    throw new Error(
      `Incorrect format of the function file name: ${fileName} in ${path.dirname(filePath)}`
    )
  }

  readonly namingRoot = path.join(__dirname, '..', '..')

  readonly appDirRelativeToFilePath = '..'

  get handler(): string {
    if (this._handler === undefined) {
      const appDir = path.join(path.dirname(this.filePath), this.appDirRelativeToFilePath)
      const relPath = posix(path.relative(appDir, this.filePath))
      const modulePath = relPath.substr(0, relPath.length - 3)
      this._handler = `${modulePath}.default`
    }

    return this._handler
  }

  get name(): string {
    if (this._name === undefined) {
      const prefix = path.relative(
        this.namingRoot,
        path.join(path.dirname(this.filePath), this.appDirRelativeToFilePath)
      )

      const base = path.basename(this.filePath)

      const parts = [prefix, base.substr(0, base.length - 3)]

      this._name = camelize(parts.filter(Boolean).join(':'))
    }

    return this._name
  }

  get key(): string {
    if (this._key === undefined) {
      const base = path.basename(this.filePath)

      this._key = camelize(base.substr(0, base.length - 3))
    }

    return this._key
  }

  get function(): ServerlessFunc {
    if (this._function === undefined) {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      this._function = require(this.filePath).default

      if (!isServerlessFunc(this._function)) {
        throw new Error(`${this.filePath} is not a valid serverless function`)
      }
    }

    return this._function
  }

  constructor(readonly filePath: string) {}

  _handler?: string

  _name?: string

  _key?: string

  _function?: ServerlessFunc
}
