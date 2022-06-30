export default interface HttpActionMiddlewareContext<
  C extends new (...args: readonly unknown[]) => { exec(): unknown } = new (
    ...args: readonly unknown[]
  ) => { exec(): unknown }
> {
  readonly action: C

  get actionInstance(): InstanceType<C>

  next(): Promise<void>
}
