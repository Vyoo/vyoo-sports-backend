// import type { IncomingHttpHeaders } from 'http2'
// import MultiValueDict from '&/utils/MultiValueDict'

// type HttpRequestHeaders = IncomingHttpHeaders & MultiValueDict<string>

type HttpRequestHeaders = [name: string, value: string][]

export default HttpRequestHeaders
