import type UnionToIntersection from '$/utils/UnionToIntersection'
import Dsl from './Dsl'
import type DslClass from './DslClass'
import type DslSteps from './DslSteps'
import type Step from './Step'

const objectPrototype = Object.getPrototypeOf(Object)

const applyDsl = <
  T,
  D extends readonly DslClass[],
  U = UnionToIntersection<InstanceType<D[number]>>
>(
  target: T,
  ...dsls: D
): T & DslSteps<U> => {
  dsls.forEach((dsl: any) => {
    let steps: Record<string, Step> = dsl['@@steps']

    if (dsl['@@steps'] === undefined) {
      steps = {}

      let source = dsl

      for (;;) {
        const props = Object.getOwnPropertyDescriptors(source.prototype)

        Object.entries(props).forEach(([name, prop]) => {
          if (steps[name] === undefined) {
            if (typeof prop.value === 'function') {
              steps[name] = prop.value
            }
          }
        })

        source = Object.getPrototypeOf(source)

        if (!source || source === Dsl || source === objectPrototype) {
          break
        }
      }

      dsl['@@steps'] = steps
    }

    Object.assign(target, steps)
  })

  return target as any
}

export default applyDsl
