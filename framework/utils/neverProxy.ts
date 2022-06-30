const neverError = () => new Error(`Can not access this object at this time`)

const neverProxy: any = new Proxy({}, {
  ownKeys() {
    throw neverError()
  },
  getOwnPropertyDescriptor() {
    throw neverError()
  },
  isExtensible() {
    throw neverError()
  },
  preventExtensions() {
    throw neverError()
  },
  has() {
    throw neverError()
  },
  get() {
    throw neverError()
  },
  set() {
    throw neverError()
  },
  defineProperty() {
    throw neverError()
  },
  deleteProperty() {
    throw neverError()
  },
  apply() {
    throw neverError()
  },
  construct() {
    throw neverError()
  },
  getPrototypeOf() {
    throw neverError()
  },
  setPrototypeOf() {
    throw neverError()
  },
} as ProxyHandler<any>)

export default neverProxy
