import type SchemaNode from '~/schema/SchemaNode'
import type DefaultAllSchemaNode from '~/schema/all/DefaultAllSchemaNode'
// import type DefaultAnySchemaNode from '~/schema/any/DefaultAnySchemaNode'
import type DefaultArraySchemaNode from '~/schema/array/DefaultArraySchemaNode'
import type DefaultBooleanSchemaNode from '~/schema/boolean/DefaultBooleanSchemaNode'
import type DefaultNumberSchemaNode from '~/schema/number/DefaultNumberSchemaNode'
import type DefaultObjectSchemaNode from '~/schema/object/DefaultObjectSchemaNode'
import type DefaultOneSchemaNode from '~/schema/one/DefaultOneSchemaNode'
import type DefaultStringSchemaNode from '~/schema/string/DefaultStringSchemaNode'

export default interface HttpActionResultSchemaBuilder {
  all<L extends SchemaNode, R extends SchemaNode>(
    branches: readonly [L, R]
  ): DefaultAllSchemaNode<L, R>

  // anyOf<L extends SchemaNode, R extends SchemaNode>(
  //   branches: readonly [L, R]
  // ): DefaultAnySchemaNode<L, R>

  array<T>(items: T): DefaultArraySchemaNode<T>

  boolean(): DefaultBooleanSchemaNode

  number(): DefaultNumberSchemaNode

  object<T>(properties: T): DefaultObjectSchemaNode<T>

  one<L extends SchemaNode, R extends SchemaNode>(
    branches: readonly [L, R]
  ): DefaultOneSchemaNode<L, R>

  string(): DefaultStringSchemaNode
}
