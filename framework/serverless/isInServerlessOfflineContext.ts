const isInServerlessOfflineContext = () => process.env.IS_OFFLINE === 'true'

export default isInServerlessOfflineContext
