import type { Readable } from 'stream'
// import type MultiValueDict from '&/utils/MultiValueDict'

export default interface HttpRequestBody {
  raw(): Readable

  binary(): Promise<Buffer>

  binarySync(): Buffer

  text(): Promise<string>

  textSync(): string

  json<T = any>(): Promise<T>

  jsonSync<T = any>(): T

  // urlencoded(): Promise<MultiValueDict<string>>
  urlencoded(): Promise<readonly [string, string][]>

  // urlencodedSync(): MultiValueDict<string>
  urlencodedSync(): readonly [string, string][]

  // TODO
  // file()
}
