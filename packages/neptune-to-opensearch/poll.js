/* eslint-disable import/no-commonjs */

exports.__esModule = true

exports.default = (event, context) => {
  // eslint-disable-next-line no-console
  console.log('event:', JSON.stringify(event, null, 2))

  // eslint-disable-next-line no-console
  console.log('context:', context)
}
