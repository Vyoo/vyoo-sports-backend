import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import './fetch-ssm-parameters'

const getSsmParameters = (): { [name: string]: string } => {
  const prefixes = process.env.PARAMETER_STORE_PREFIX

  if (!prefixes) {
    console.warn(`getSsmParameters(): no PARAMETER_STORE_PREFIX env var, returning empty object`)
    return {}
  }

  const scriptPath = path.join(__dirname, 'fetch-ssm-parameters.js')

  if (!fs.existsSync(scriptPath)) {
    console.warn(
      `getSsmParameters(): no fetch script found in ${__dirname}, returning empty object`
    )
    return {}
  }

  const out = execFileSync(process.execPath, [scriptPath], {
    windowsHide: true,
    maxBuffer: Infinity,
    shell: false,
    env: {
      ...process.env,
      DO_FETCH_SSM_PARAMETERS: 'true',
    },
  })

  const res = JSON.parse(out.toString())

  // console.log(`SSM PARAMETERS:`, JSON.stringify(res, null, 2))

  return res
}

export default getSsmParameters
