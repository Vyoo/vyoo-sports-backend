type Step<A extends readonly any[] = []> = <This>(this: This, ...args: A) => This

export default Step
