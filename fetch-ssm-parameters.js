const { SSM } = require('aws-sdk')

const main = async () => {
  const prefixes = process.env.PARAMETER_STORE_PREFIX.split(',')

  const ssm = new SSM()

  const result = {}

  for (const prefix of prefixes) {
    let nextToken

    for (;;) {
      const res = await ssm
        .getParametersByPath({
          Path: prefix,
          WithDecryption: true,
          NextToken: nextToken,
        })
        .promise()

      const items = Array.isArray(res.Parameters)
        ? res.Parameters.map(parameter => [parameter.Name, parameter.Value])
        : Object.entries(res.Parameters)

      items.forEach(([name, value]) => {
        const key = name.substr(prefix.length + 1)

        if (!(key in result)) {
          result[key] = value
        }
      })

      if (res.NextToken) {
        nextToken = res.NextToken
      } else {
        break
      }
    }
  }

  return result
}

if (process.env.DO_FETCH_SSM_PARAMETERS === 'true') {
  main().then(
    res => {
      console.log(JSON.stringify(res))
      process.exit(0)
    },
    err => {
      console.error(err)
      process.exit(1)
    }
  )
}
