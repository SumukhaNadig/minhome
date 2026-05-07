import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env'
import { connectMongo } from './db'
import { currentUser } from './middleware/currentUser'
import { errorHandler } from './middleware/errorHandler'
import { buildApiRouter } from './routes'

export function buildApp() {
  const app = express()
  app.use(cors())
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'))
  app.use(express.json({ limit: '1mb' }))
  app.use(currentUser)

  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.use('/api', buildApiRouter())

  app.use(errorHandler)
  return app
}

async function main() {
  await connectMongo()
  const app = buildApp()
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MinHome API listening on http://localhost:${env.PORT}`)
  })
}

if (require.main === module) {
  main().catch(err => {
    // eslint-disable-next-line no-console
    console.error('Fatal startup error:', err)
    process.exit(1)
  })
}
