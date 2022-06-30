type SchemaNodeOut<T> = T extends { readonly $$out: infer U } ? U : never

export default SchemaNodeOut
