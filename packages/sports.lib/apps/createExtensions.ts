import type AppBuilder from '&/core/AppBuilder'
import Auth from '~/auth/Auth'
import { Role } from '~/enums'
import type RequiredExtensions from './RequiredExtensions'
import type SportsExtensions from './SportsExtensions'
import decorateConfigureServerless from './decorateConfigureServerless'

const createExtensions = (app: AppBuilder<RequiredExtensions>): SportsExtensions => {
  const { configureServerless } = app

  return {
    Auth,
    Role,
    configureServerless: decorateConfigureServerless(configureServerless),
  }
}

export default createExtensions
