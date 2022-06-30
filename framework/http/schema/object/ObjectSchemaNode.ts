import type JsonSchemaFragment from '~/schema/JsonSchemaFragment'
import type JsonSchemaType from '~/schema/JsonSchemaType'
import type OpenApiSchemaFragment from '~/schema/OpenApiSchemaFragment'
import type OpenApiSchemaType from '~/schema/OpenApiSchemaType'
import type SchemaNode from '~/schema/SchemaNode'
import SchemaNodeBase from '~/schema/SchemaNodeBase'
import type DefaultObjectSchemaNode from './DefaultObjectSchemaNode'

export default class ObjectSchemaNode<
  Out,
  Optional extends boolean,
  Nullable extends boolean,
  JSchema extends JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment
> extends SchemaNodeBase<unknown, Out, Optional, Nullable, JSchema, OSchema> {
  static of<T extends { readonly [key: string]: SchemaNode }>(
    shape: T
  ): DefaultObjectSchemaNode<T> {
    const required: (keyof T)[] = []
    const jsonSchemaProperties: { [K in keyof T]: JsonSchemaType<T[K]> } = {} as any
    const openApiSchemaProperties: { [K in keyof T]: OpenApiSchemaType<T[K]> } = {} as any

    Object.entries(shape).forEach(([key, value]: [keyof T, SchemaNode]) => {
      if (!value.$$optional) {
        required.push(key)
      }

      jsonSchemaProperties[key] = value.$$jsonSchema as JsonSchemaType<T[keyof T]>
      openApiSchemaProperties[key] = value.$$openApiSchema as OpenApiSchemaType<T[keyof T]>
    })

    return new ObjectSchemaNode(
      false,
      false,
      {
        type: 'object',
        required,
        properties: jsonSchemaProperties,
        additionalProperties: false,
      } as const,
      {
        type: 'object',
        required,
        properties: openApiSchemaProperties,
        additionalProperties: false,
      } as const
    )
  }

  optional<T extends boolean>(
    yes?: T
  ): ObjectSchemaNode<
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
  ): ObjectSchemaNode<
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
  ): ObjectSchemaNode<
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
  ): ObjectSchemaNode<
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
  ): ObjectSchemaNode<
    Out,
    Optional,
    Nullable,
    Omit<JSchema, 'description'> & { readonly description: T },
    Omit<OSchema, 'description'> & { readonly description: T }
  > {
    return this.$desc(value)
  }
}
