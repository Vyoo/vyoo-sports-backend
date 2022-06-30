import type Fragment from './Fragment'

const isFragment = (obj: any): obj is Fragment => typeof obj === 'function'

export default isFragment
