import 'reflect-metadata'
import HttpMetadataManager from '&/http/HttpMetadataManager'
import { MetadataKey, Role } from '~/enums'

const isArray = (obj: any): obj is readonly any[] => Array.isArray(obj)

const Auth =
  (role: Role | readonly Role[]): ClassDecorator =>
  (target: Function): void => {
    const root = HttpMetadataManager.getRootUnderlyingObject(target)

    const existing: Role[] = Reflect.getMetadata(MetadataKey.authRoles, root)

    const meta = existing || []

    if (isArray(role)) {
      role.forEach(each => {
        if (!meta.includes(each)) {
          meta.push(each)
        }
      })
    } else if (!meta.includes(role)) {
      meta.push(role)
    }

    Reflect.defineMetadata(MetadataKey.authRoles, meta, root)
  }

export default Auth
