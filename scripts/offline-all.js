const { execFile, execSync } = require('child_process')
const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')
const { createInterface } = require('readline')
const ProxyServer = require('http-proxy')

const slsPath = require.resolve('serverless/bin/serverless')

const logsDir = path.join(__dirname, '..', 'logs')

const appNames = ['playground', 'sports', 'soccer']

const maxAppNameLength = appNames.reduce((acc, appName) => Math.max(acc, appName.length), 4)

const prefix = str => `${str || 'main'}>`.padEnd(maxAppNameLength + 3, ' ')

const rx1 = /[|\\{}()[\]^$+*?.]/g
const rx2 = /-/g
const escapeRx = str => str.replace(rx1, '\\$&').replace(rx2, '\\x2d')

const mainAsync = async () => {
  let server
  const procs = {}

  let terminated = false

  const terminate = () => {
    if (!terminated) {
      terminated = true

      Object.entries(procs).forEach(([appName, proc]) => {
        console.log(`${prefix()} terminating ${appName}`)

        try {
          if (os.platform() === 'win32') {
            execSync(`taskkill /f /t /pid ${proc.pid}`, { shell: true })
          } else {
            proc.kill()
          }
        } catch (exc) {
          console.error(`${prefix()} failed to terminate ${appName} (pid=${proc.pid}):\r\n${exc}`)
        }

        proc.unref()
      })

      if (server) {
        console.log(`${prefix()} terminating server`)
        server.close()
      }
    }
  }

  process.on('SIGINT', terminate)
  process.on('SIGTERM', terminate)
  process.on('SIGABRT', terminate)

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
  }

  const urls = []

  let running = false

  await Promise.all(
    ['playground', 'sports', 'soccer'].map(
      appName =>
        new Promise((resolve, reject) => {
          const stdoutFilePath = path.join(logsDir, `${appName}.stdout.log`)

          const proc = execFile(process.execPath, [slsPath, `${appName}:offline`], {
            windowsHide: true,
            maxBuffer: Infinity,
            shell: false,
            stdio: 'pipe',
            // stdio: ['pipe', fs.openSync(stdoutFilePath, 'w'), 'pipe'],
            cwd: path.join(__dirname, '..'),
          })

          proc.stdoutFilePath = stdoutFilePath
          proc.stdoutFile = fs.createWriteStream(proc.stdoutFilePath, { encoding: 'binary' })

          proc.stdout.on('data', data => {
            proc.stdoutFile.write(data)
          })

          proc.stdoutInterface = createInterface({
            input: proc.stdout,
          })

          proc.stdoutInterface.on('line', stdoutLine => {
            if (running) {
              console.log(`${prefix(appName)} ${stdoutLine}`)
            }
          })

          proc.stderrFilePath = path.join(logsDir, `${appName}.stderr.log`)
          proc.stderrFile = fs.createWriteStream(proc.stderrFilePath, { encoding: 'binary' })

          proc.stderr.on('data', data => {
            proc.stderrFile.write(data)
          })

          proc.stderrInterface = createInterface({
            input: proc.stderr,
          })

          proc.stderrInterface.on('line', stderrLine => {
            if (running) {
              console.warn(`${prefix(appName)} ${stderrLine}`)
            } else {
              const stderrMatch = /Server ready: (.+?) 🚀/.exec(stderrLine)

              if (stderrMatch) {
                console.warn(`${prefix(appName)} ${stderrLine}`)

                // eslint-disable-next-line prefer-destructuring
                const target = stderrMatch[1]

                const stdout = fs.createReadStream(proc.stdoutFilePath)

                const stdoutInterface = createInterface({
                  input: stdout,
                })

                stdoutInterface.on('line', stdoutLine => {
                  const rx = new RegExp(
                    `\\x02\\x02(\\s*?(\\w+?)\\s*?\\|\\s*?(${escapeRx(
                      target
                    )}(.+?)))\\s+?\\x02\\x02`,
                    'g'
                  )

                  for (;;) {
                    const stdoutMatch = rx.exec(stdoutLine)

                    if (stdoutMatch) {
                      // eslint-disable-next-line prefer-destructuring
                      const method = stdoutMatch[2]

                      // eslint-disable-next-line prefer-destructuring,@typescript-eslint/no-shadow
                      const path = stdoutMatch[4]

                      urls.push({
                        method,
                        path,
                        target,
                      })

                      console.log(`${prefix(appName)} ${method} ${path} ~> ${target}`)
                    } else {
                      break
                    }
                  }
                })

                stdoutInterface.on('close', () => {
                  resolve()
                })
              }
            }
          })

          procs[appName] = proc

          console.log(`${prefix()} ${appName} started with pid ${proc.pid}`)

          proc.once('exit', () => {
            console.log(`${prefix()} ${appName} exited with code ${proc.exitCode}`)

            terminate()

            reject(
              new Error(
                `${appName} exited with code ${proc.exitCode}\r\n${fs.readFileSync(
                  proc.stderrFilePath,
                  { encoding: 'utf8' }
                )}`
              )
            )
          })

          proc.once('error', err => {
            console.error(`${prefix()} ${appName} emitted an error:\r\n${err}`)

            terminate()

            reject(err)
          })

          // const prefix = `${appName}>`.padEnd(12, ' ')
          //
          // let searchBuffer = ''
          // 'Server ready: http://localhost:3000 🚀\n'
          //
          // proc.stdout.on('data', data => {
          //   proc.stdoutFile.write(data)
          //   resolve()
          //   // console.log(`${prefix}${data.replace(/\r?\n/g, `$&${prefix}`)}`)
          // })
          //
          // proc.stdout.on('error', err => {
          //   console.error(`${appName}:stdout emitted an error:\r\n${err}`)
          //   terminate()
          //   reject(err)
          // })
          //
          // proc.stderr.on('data', data => {
          //   proc.stderrFile.write(data)
          //   // resolve()
          //   // console.warn(`${prefix}${data.replace(/\r?\n/g, `$&${prefix}`)}`)
          // })
          //
          // proc.stderr.on('error', err => {
          //   console.warn(`${appName}:stderr emitted an error:\r\n${err}`)
          //   terminate()
          //   reject(err)
          // })
        })
    )
  )

  if (!terminated) {
    running = true

    const proxy = new ProxyServer()

    server = http
      .createServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        for (const { method, path, target } of urls) {
          if (method === 'ANY' || req.method === method) {
            const pos = path.indexOf('{')

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const prefix = pos < 0 ? path : path.substr(0, pos)

            if (req.url.startsWith(prefix)) {
              console.log(`match: ${req.url} > ${target} [${method} ${path}]`)
              proxy.web(req, res, { target })
              return
            }
          }
        }

        res.writeHead(404)
        res.write('No match')
        res.end()
      })
      .listen(3000)
  }
}

mainAsync().then(
  () => {
    // console.log('all done')
    // process.exit(0)
  },
  err => {
    console.error(`fatal error:\r\n${err}\r\n${err.stack}`)
    process.exit(1)
  }
)
