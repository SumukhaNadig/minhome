import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import { HttpError } from '../errors'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', issues: err.issues })
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: err.message, fields: err.errors })
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, detail: err.detail })
  }
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
}
