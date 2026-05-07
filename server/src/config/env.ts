const required = (name: string, fallback?: string): string => {
  const v = process.env[name] ?? fallback
  if (v === undefined) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const env = {
  NODE_ENV: required('NODE_ENV', 'development'),
  PORT: parseInt(required('PORT', '4000'), 10),
  MONGO_URL: required('MONGO_URL'),
  MONGO_TEST_URL: required('MONGO_TEST_URL', 'mongodb://localhost:27017/minhome-test'),
  KAFKA_BROKERS: required('KAFKA_BROKERS', 'localhost:9092').split(','),
}
