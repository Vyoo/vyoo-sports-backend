const hasProperties = (obj: any): obj is Record<keyof any, any> => {
  if (obj === null) {
    return false
  }

  const type = typeof obj

  return type === 'object' || type === 'function'
}

export default hasProperties
