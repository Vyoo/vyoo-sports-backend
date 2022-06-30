// import MultiValueDict from '&/utils/MultiValueDict'

// type HttpRequestQueryParams = MultiValueDict<string>

type HttpRequestQueryParams = readonly [name: string, value: string][]

export default HttpRequestQueryParams
