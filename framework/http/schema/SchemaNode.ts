import type JsonSchemaFragment from './JsonSchemaFragment'
import type OpenApiSchemaFragment from './OpenApiSchemaFragment'

export default interface SchemaNode<
  In = unknown,
  Out = unknown,
  Optional extends boolean = boolean,
  Nullable extends boolean = boolean,
  JSchema extends JsonSchemaFragment = JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment = OpenApiSchemaFragment
> {
  readonly $$in: In

  readonly $$out: Out

  readonly $$optional: Optional

  readonly $$nullable: Nullable

  readonly $$jsonSchema: JSchema

  readonly $$openApiSchema: OSchema
}
