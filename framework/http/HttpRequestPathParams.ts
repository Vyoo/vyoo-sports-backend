// import MultiValueDict from '&/utils/MultiValueDict'

// type HttpRequestPathParams = MultiValueDict<string>

type HttpRequestPathParams = readonly [name: string, value: string][]

export default HttpRequestPathParams
