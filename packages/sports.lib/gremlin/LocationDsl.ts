import Dsl from './Dsl'

export default class LocationDsl extends Dsl {
  // protected readonly g = this.use()

  location(id: string): this {
    return this.V(id).hasLabel('Location')
  }

  // readonly location = this.step(
  //   (id: string) => g => g.V(id).has('Location', 'graph', this.ctx.graphName)
  // )

  createLocation(params: {
    readonly lat: number
    readonly lng: number
    readonly address: string
  }): this {
    return this.addV('Location')
      .property('lat', params.lat)
      .property('lng', params.lng)
      .property('geo', `${params.lat},${params.lng}`)
      .property('address', params.address)
  }
}
