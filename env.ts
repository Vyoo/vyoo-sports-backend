import path from 'path'
import defaults from './env.defaults'
import getSsmParameters from './getSsmParameters'

try {
  require('dotenv').config({
    path: path.join(__dirname, '.env'),
  })
} catch (_) {
  // console.warn(`dotenv module not found - not loading .env file`)
}

const params = getSsmParameters()

const merge = <T1, T2, T3>(...objects: [T1, T2, T3]): T1 & T2 & T3 => {
  const result: any = {}

  objects.forEach(obj => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value.trim() !== '' || result[key] === undefined) {
          result[key] = value
        }
      }
    })
  })

  return result
}

const env = merge(defaults, params, process.env)

export default env
