const posixRx = /\\/g

const posix = (str: string): string => str.replace(posixRx, '/')

export default posix
