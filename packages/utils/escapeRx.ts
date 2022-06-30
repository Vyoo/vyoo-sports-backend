const rx1 = /[|\\{}()[\]^$+*?.]/g

const rx2 = /-/g

const escapeRx = (str: string) => str.replace(rx1, '\\$&').replace(rx2, '\\x2d')

export default escapeRx
