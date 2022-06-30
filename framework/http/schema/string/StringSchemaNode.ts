import type JsonSchemaFragment from '~/schema/JsonSchemaFragment'
import type OpenApiSchemaFragment from '~/schema/OpenApiSchemaFragment'
import SchemaNodeBase from '~/schema/SchemaNodeBase'
import type DefaultStringSchemaNode from './DefaultStringSchemaNode'

export default class StringSchemaNode<
  Out,
  Optional extends boolean,
  Nullable extends boolean,
  JSchema extends JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment
> extends SchemaNodeBase<string, Out, Optional, Nullable, JSchema, OSchema> {
  static default(): DefaultStringSchemaNode {
    return new StringSchemaNode(
      false,
      false,
      { type: 'string' } as const,
      { type: 'string' } as const
    )
  }

  optional<T extends boolean>(
    yes?: T
  ): StringSchemaNode<
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
  ): StringSchemaNode<
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
  ): StringSchemaNode<
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
  ): StringSchemaNode<
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
  ): StringSchemaNode<
    Out,
    Optional,
    Nullable,
    Omit<JSchema, 'description'> & { readonly description: T },
    Omit<OSchema, 'description'> & { readonly description: T }
  > {
    return this.$desc(value)
  }
}
