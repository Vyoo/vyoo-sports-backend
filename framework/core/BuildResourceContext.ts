import AppBuilder from './AppBuilder'

export default interface BuildResourceContext<Extensions> {
  /**
   * {AppBuilder} instance on which {build} method was called
   */
  readonly builder: AppBuilder<Extensions>

  readonly resource: unknown

  next(): void
}
