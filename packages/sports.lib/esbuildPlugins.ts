import path from 'path'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { copy } from 'esbuild-plugin-copy'

module.exports = [
  nodeExternalsPlugin({
    packagePath: path.join(__dirname, '..', '..', 'package.json'),
  }),
  copy({
    // verbose: true,
    // dryRun: true,
    assets: {
      from: ['assets/**/*'],
      to: ['../assets'],
      keepStructure: true,
    },
  }),
]
