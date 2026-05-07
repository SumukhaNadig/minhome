import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Note } from '../models/Note'

const query = z.object({
  transactionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const NoteController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId, limit, offset } = query.parse(req.query)
      const [items, total] = await Promise.all([
        Note.find({ transactionId }).sort({ createdAt: -1 }).skip(offset).limit(limit),
        Note.countDocuments({ transactionId }),
      ])
      res.json({ items, total, limit, offset })
    } catch (e) { next(e) }
  },
}
