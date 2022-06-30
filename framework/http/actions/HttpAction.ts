import type HttpActionTarget from './decorators/HttpActionTarget'

type HttpAction<T = HttpActionTarget> = T

export default HttpAction
