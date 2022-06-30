type JsonSchemaType<T> = T extends { readonly $jsonSchema: infer U } ? U : never

export default JsonSchemaType
