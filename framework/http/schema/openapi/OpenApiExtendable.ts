type OpenApiExtendable<T> = T & {
  [key: `x-${string}`]: any
}

export default OpenApiExtendable
