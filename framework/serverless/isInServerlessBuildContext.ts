const isInServerlessBuildContext = () => process.env.IN_SERVERLESS_BUILD_CONTEXT === 'true'

export default isInServerlessBuildContext
