import type App from './App'
import appSymbol from './appSymbol'

/**
 * Tests if provided object is a valid {App} instance
 * @param obj
 * @returns {obj is App}
 */
const isApp = (obj: any): obj is App => typeof obj === 'object' && obj[appSymbol] === true

export default isApp
