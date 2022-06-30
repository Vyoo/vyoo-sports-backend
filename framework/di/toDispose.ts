import dispose from './dispose'

const toDispose = (obj: any): undefined | ((obj: any) => void) => {
  const type = typeof obj

  if (type === 'function' || type === 'object') {
    if (typeof obj.dispose === 'function') {
      return dispose
    }
  }

  return undefined
}

export default toDispose
