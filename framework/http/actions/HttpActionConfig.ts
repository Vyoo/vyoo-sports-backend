export default interface HttpActionConfig {
  readonly mount: readonly (readonly [method: string, path: string])[]

  readonly handler: undefined | readonly [fileName: string, exportName: string]

  readonly key: undefined | string

  readonly name: undefined | string
}
