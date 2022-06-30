import type ServiceId from './ServiceId'

/**
 * Type-helper that converts known service ID forms into their presumed implementation type
 */
type Resolved<D> = D extends ServiceId<infer V>
  ? V extends new (...args: any[]) => infer T
    ? T
    : V extends abstract new (...args: any[]) => infer T
    ? T
    : V
  : D extends new (...args: any[]) => infer T
  ? T
  : D extends abstract new (...args: any[]) => infer T
  ? T
  : D

export default Resolved
