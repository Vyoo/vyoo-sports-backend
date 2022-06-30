import type JsonSchemaFragment from './JsonSchemaFragment'
import type OpenApiSchemaFragment from './OpenApiSchemaFragment'
import type SchemaNode from './SchemaNode'

export default abstract class SchemaNodeBase<
  In = unknown,
  Out = unknown,
  Optional extends boolean = boolean,
  Nullable extends boolean = boolean,
  JSchema extends JsonSchemaFragment = JsonSchemaFragment,
  OSchema extends OpenApiSchemaFragment = OpenApiSchemaFragment
> implements SchemaNode<In, Out, Optional, Nullable, JSchema, OSchema>
{
  readonly $$in!: In

  readonly $$out!: Out

  get $$Ctor(): new <
    TIn,
    TOut,
    TOptional extends boolean,
    TNullable extends boolean,
    TJSchema extends JsonSchemaFragment,
    TOSchema extends OpenApiSchemaFragment
  >(
    $$optional: TOptional,
    $$nullable: TNullable,
    $$jsonSchema: TJSchema,
    $$openApiSchema: TOSchema
  ) => SchemaNodeBase<TIn, TOut, TOptional, TNullable, TJSchema, TOSchema> {
    return this.constructor as any
  }

  constructor(
    readonly $$optional: Optional,
    readonly $$nullable: Nullable,
    readonly $$jsonSchema: JSchema,
    readonly $$openApiSchema: OSchema
  ) {}

  protected $optional<T extends boolean>(yes?: T): any {
    return new this.$$Ctor(yes !== false, this.$$nullable, this.$$jsonSchema, this.$$openApiSchema)
  }

  protected $required<T extends boolean>(yes?: T): any {
    return new this.$$Ctor(yes === false, this.$$nullable, this.$$jsonSchema, this.$$openApiSchema)
  }

  protected $nullable<T extends boolean>(yes?: T): any {
    return new this.$$Ctor(
      this.$$optional,
      yes !== false,
      (yes !== false) === this.$$nullable
        ? this.$$jsonSchema
        : yes !== false
        ? { anyOf: [{ type: 'null' }, this.$$jsonSchema] }
        : this.$$jsonSchema.anyOf[1],
      { ...this.$$openApiSchema, nullable: yes !== false }
    )
  }

  protected $title(value: string): any {
    return new this.$$Ctor(
      this.$$optional,
      this.$$nullable,
      { ...this.$$jsonSchema, title: value },
      { ...this.$$openApiSchema, title: value }
    )
  }

  protected $desc(value: string): any {
    return new this.$$Ctor(
      this.$$optional,
      this.$$nullable,
      { ...this.$$jsonSchema, description: value },
      { ...this.$$openApiSchema, description: value }
    )
  }
}
