export default interface HttpActionTarget {
  new (...args: readonly any[]): {
    exec(): unknown
  }
}
