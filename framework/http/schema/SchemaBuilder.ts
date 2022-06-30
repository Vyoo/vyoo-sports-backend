import type SchemaNode from './SchemaNode'
import AllSchemaNode from './all/AllSchemaNode'
import type DefaultAllSchemaNode from './all/DefaultAllSchemaNode'
import ArraySchemaNode from './array/ArraySchemaNode'
import type DefaultArraySchemaNode from './array/DefaultArraySchemaNode'
import BooleanSchemaNode from './boolean/BooleanSchemaNode'
import type DefaultBooleanSchemaNode from './boolean/DefaultBooleanSchemaNode'
import type DefaultNumberSchemaNode from './number/DefaultNumberSchemaNode'
import NumberSchemaNode from './number/NumberSchemaNode'
import type DefaultObjectSchemaNode from './object/DefaultObjectSchemaNode'
import ObjectSchemaNode from './object/ObjectSchemaNode'
import type DefaultOneSchemaNode from './one/DefaultOneSchemaNode'
import OneSchemaNode from './one/OneSchemaNode'
import type DefaultStringSchemaNode from './string/DefaultStringSchemaNode'
import StringSchemaNode from './string/StringSchemaNode'

export default class SchemaBuilder {
  static readonly instance = new SchemaBuilder()

  constructor() {
    if (SchemaBuilder.instance) {
      // eslint-disable-next-line no-constructor-return
      return SchemaBuilder.instance
    }
  }

  all<L extends SchemaNode, R extends SchemaNode>(
    branches: readonly [L, R]
  ): DefaultAllSchemaNode<L, R> {
    return AllSchemaNode.of(branches)
  }

  array(items: SchemaNode): DefaultArraySchemaNode<any> {
    return ArraySchemaNode.of(items)
  }

  boolean(): DefaultBooleanSchemaNode {
    return BooleanSchemaNode.default()
  }

  number(): DefaultNumberSchemaNode {
    return NumberSchemaNode.default()
  }

  object(props: Record<string, SchemaNode>): DefaultObjectSchemaNode<any> {
    return ObjectSchemaNode.of(props)
  }

  one<L extends SchemaNode, R extends SchemaNode>(
    branches: readonly [L, R]
  ): DefaultOneSchemaNode<L, R> {
    return OneSchemaNode.of(branches)
  }

  string(): DefaultStringSchemaNode {
    return StringSchemaNode.default()
  }
}
