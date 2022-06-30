export default interface GetAppOptions {
  build?:
    | undefined
    | {
        skipValidation?: undefined | boolean
      }
}
