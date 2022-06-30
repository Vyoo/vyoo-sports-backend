import HttpMetadataManager from '~/HttpMetadataManager'
import type HttpAction from './HttpAction'

const isHttpAction = (obj: any): obj is HttpAction =>
  typeof obj === 'function' && HttpMetadataManager.getHttpActionId(obj)

export default isHttpAction
