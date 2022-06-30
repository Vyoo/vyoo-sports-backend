import type AppBuilder from '&/core/AppBuilder'
import AppBuilderPluginBase from '&/core/AppBuilderPluginBase'
import ServiceId from '&/di/ServiceId'
import Log from './Log'

export default class LoggingPlugin<R = {}, E = {}> extends AppBuilderPluginBase<R, E> {
  constructor(app: AppBuilder<R>) {
    super(app)

    app.appRegistry.registerService(Log, {
      scope: 'dependency',

      factory(ctx): Log {
        // const name =
        //   (typeof ctx.request.id.value === 'function' &&
        //     ctx.request.id.value.name &&
        //     `:${ctx.request.id.value.name}`) ||
        //   '<unknown>'

        let { scope } = ctx.provider

        const name = scope.name ?? (scope.tags[0] ? `${scope.tags[0]}` : undefined) ?? '<unknown>'

        scope = scope.parent

        for (;;) {
          const log = scope.maybeGetInstance(ServiceId.of(Log))

          if (log !== undefined && log instanceof Log) {
            return ctx.provider.instantiate<typeof Log>(Log, name, [...log.path, name])
          }

          const { parent } = scope

          if (parent === scope) {
            break
          }

          scope = parent
        }

        return ctx.provider.instantiate<typeof Log>(Log, name)
      },
    })
  }
}
