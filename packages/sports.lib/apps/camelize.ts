const camelizeRx = /[_\W]+(\w|$)/g

const camelize = (str: string): string =>
  str.replace(camelizeRx, (_, letter, index) =>
    letter[index === 0 ? 'toLowerCase' : 'toUpperCase']()
  )

export default camelize
