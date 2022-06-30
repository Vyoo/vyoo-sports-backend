import type JsonSchemaFragment from '~/schema/JsonSchemaFragment'
import type OpenApiSchemaFragment from '~/schema/OpenApiSchemaFragment'
import SchemaNodeBase from '~/schema/SchemaNodeBase'
import type DefaultNumberSchemaNode from './DefaultNumberSchemaNode'

export default class NumberSchemaNode<
  Out,
  Optional extends boolean,
  Nullable extends boolean,
  JSchema extends JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment
> extends SchemaNodeBase<number, Out, Optional, Nullable, JSchema, OSchema> {
  static default(): DefaultNumberSchemaNode {
    return new NumberSchemaNode(
      false,
      false,
      { type: 'number' } as const,
      { type: 'number' } as const
    )
  }

  optional<T extends boolean>(
    yes?: T
  ): NumberSchemaNode<
    [T] extends [false] ? Exclude<Out, undefined> : undefined | Out,
    [T] extends [false] ? false : true,
    Nullable,
    JSchema,
    OSchema
  > {
    return this.$optional(yes)
  }

  required<T extends boolean>(
    yes?: T
  ): NumberSchemaNode<
    [T] extends [false] ? undefined | Out : Exclude<Out, undefined>,
    [T] extends [false] ? true : false,
    Nullable,
    JSchema,
    OSchema
  > {
    return this.$required(yes)
  }

  nullable<T extends boolean>(
    yes?: T
  ): NumberSchemaNode<
    [T] extends [false] ? Exclude<Out, null> : null | Out,
    Optional,
    [T] extends [false] ? false : true,
    JSchema,
    OSchema
  > {
    return this.$nullable(yes)
  }

  title<T extends string>(
    value: T
  ): NumberSchemaNode<
    Out,
    Optional,
    Nullable,
    Omit<JSchema, 'title'> & { readonly title: T },
    Omit<OSchema, 'title'> & { readonly title: T }
  > {
    return this.$title(value)
  }

  desc<T extends string>(
    value: T
  ): NumberSchemaNode<
    Out,
    Optional,
    Nullable,
    Omit<JSchema, 'description'> & { readonly description: T },
    Omit<OSchema, 'description'> & { readonly description: T }
  > {
    return this.$desc(value)
  }
}
