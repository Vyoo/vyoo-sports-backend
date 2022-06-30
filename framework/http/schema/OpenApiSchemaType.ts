type OpenApiSchemaType<T> = T extends { readonly $openApiSchema: infer U } ? U : never

export default OpenApiSchemaType
