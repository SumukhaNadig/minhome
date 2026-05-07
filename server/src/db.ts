import mongoose from 'mongoose'
import { env } from './config/env'

export async function connectMongo(url: string = env.MONGO_URL): Promise<void> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(url)
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect()
}
