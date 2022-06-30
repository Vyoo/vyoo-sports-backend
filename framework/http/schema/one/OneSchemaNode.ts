import type JsonSchemaFragment from '~/schema/JsonSchemaFragment'
import type OpenApiSchemaFragment from '~/schema/OpenApiSchemaFragment'
import type SchemaNode from '~/schema/SchemaNode'
import type DefaultOneSchemaNode from './DefaultOneSchemaNode'

export default class OneSchemaNode<
  Out,
  Optional extends boolean,
  Nullable extends boolean,
  JSchema extends JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment
> implements SchemaNode<unknown, Out, Optional, Nullable, JSchema, OSchema>
{
  static of<L extends SchemaNode, R extends SchemaNode>(
    nodes: readonly [L, R]
  ): DefaultOneSchemaNode<L, R> {
    return new OneSchemaNode<any, any, any, any, any>(
      !!nodes.find(x => x.$$optional),
      !!nodes.find(x => x.$$nullable),
      { oneOf: nodes.map(x => x.$$jsonSchema) } as const,
      { oneOf: nodes.map(x => x.$$openApiSchema) } as const
    )
  }

  static optimize<T extends SchemaNode>(node: T): T {
    // TODO
    return node
  }

  readonly $$in!: unknown

  readonly $$out!: Out

  constructor(
    readonly $$optional: Optional,
    readonly $$nullable: Nullable,
    readonly $$jsonSchema: JSchema,
    readonly $$openApiSchema: OSchema
  ) {}
}
