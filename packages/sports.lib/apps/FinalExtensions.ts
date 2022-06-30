import type RequiredExtensions from './RequiredExtensions'
import type SportsExtensions from './SportsExtensions'

export default interface FinalExtensions
  extends Omit<RequiredExtensions, keyof SportsExtensions>,
    SportsExtensions {}
