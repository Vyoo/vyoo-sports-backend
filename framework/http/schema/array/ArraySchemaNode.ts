import type JsonSchemaFragment from '~/schema/JsonSchemaFragment'
import type JsonSchemaType from '~/schema/JsonSchemaType'
import type OpenApiSchemaFragment from '~/schema/OpenApiSchemaFragment'
import type OpenApiSchemaType from '~/schema/OpenApiSchemaType'
import type SchemaNode from '~/schema/SchemaNode'
import SchemaNodeBase from '~/schema/SchemaNodeBase'
import type DefaultArraySchemaNode from './DefaultArraySchemaNode'

export default class ArraySchemaNode<
  Out,
  Optional extends boolean,
  Nullable extends boolean,
  JSchema extends JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment
> extends SchemaNodeBase<unknown, Out, Optional, Nullable, JSchema, OSchema> {
  static of<T extends SchemaNode>(items: T): DefaultArraySchemaNode<T> {
    return new ArraySchemaNode(
      false,
      false,
      {
        type: 'array',
        items: items.$$jsonSchema as JsonSchemaType<T>,
      } as const,
      {
        type: 'array',
        items: items.$$openApiSchema as OpenApiSchemaType<T>,
      } as const
    )
  }

  optional<T extends boolean>(
    yes?: T
  ): ArraySchemaNode<
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
  ): ArraySchemaNode<
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
  ): ArraySchemaNode<
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
  ): ArraySchemaNode<
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
  ): ArraySchemaNode<
    Out,
    Optional,
    Nullable,
    Omit<JSchema, 'description'> & { readonly description: T },
    Omit<OSchema, 'description'> & { readonly description: T }
  > {
    return this.$desc(value)
  }
}
