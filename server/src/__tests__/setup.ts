import mongoose from 'mongoose'
import { connectMongo, disconnectMongo } from '../db'
import { env } from '../config/env'

beforeAll(async () => {
  await connectMongo(env.MONGO_TEST_URL)
})

beforeEach(async () => {
  const collections = await mongoose.connection.db!.collections()
  for (const c of collections) await c.deleteMany({})
})

afterAll(async () => {
  await disconnectMongo()
})
