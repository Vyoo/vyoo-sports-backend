import ServerlessMetadataManager from '~/ServerlessMetadataManager'
import type ServerlessFuncTarget from './ServerlessFuncTarget'

const isServerlessFunc = (obj: any): obj is ServerlessFuncTarget =>
  typeof obj === 'function' && ServerlessMetadataManager.getServerlessFuncId(obj)

export default isServerlessFunc
