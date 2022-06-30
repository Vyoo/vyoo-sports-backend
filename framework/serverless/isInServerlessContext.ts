const isInServerlessContext = () => process.env.IN_SERVERLESS_CONTEXT === 'true'

export default isInServerlessContext
