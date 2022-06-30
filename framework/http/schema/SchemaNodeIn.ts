type SchemaNodeIn<T> = T extends { readonly $$in: infer U } ? U : never

export default SchemaNodeIn
