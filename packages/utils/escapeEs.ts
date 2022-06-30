const rx = /([!*+\-=<>&|()[\]{}^~?:\\/"])/g

const escapeEs = (str: string): string => str.replace(rx, '\\$1')

export default escapeEs
