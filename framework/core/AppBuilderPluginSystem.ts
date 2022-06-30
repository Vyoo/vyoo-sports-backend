import type AppBuilder from './AppBuilder'
// import AppBuilderPluginExtensionsType from './AppBuilderPluginExtensionsType'

/**
 * Dynamic part of the {AppBuilder} interface, describe the `use()`
 * method that allows adding plugins to an {AppBuilder}
 */
export default interface AppBuilderPluginSystem<E> {
  // use<P extends new (app: AppBuilder<E>) => { readonly extensions?: {} }>(
  //   plugin: P
  // ): AppBuilder<
  //   Omit<E, keyof AppBuilderPluginExtensionsType<E, P>> & AppBuilderPluginExtensionsType<E, P>
  // >

  use<N>(
    plugin: new (app: AppBuilder<E>) => { readonly extensions?: N }
  ): AppBuilder<Omit<E, keyof N> & N>

  use<N, A extends any[]>(
    plugin: new (app: AppBuilder<E>, ...args: A) => { readonly extensions?: N },
    ...args: A
  ): AppBuilder<Omit<E, keyof N> & N>
}
