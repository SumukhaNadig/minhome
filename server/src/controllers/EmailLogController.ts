import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { EmailLog } from '../models/EmailLog'

const query = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  transactionId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
})

export const EmailLogController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, transactionId } = query.parse(req.query)
      const filter: any = {}
      if (transactionId) filter.transactionId = transactionId
      const [items, total] = await Promise.all([
        EmailLog.find(filter).sort({ sentAt: -1 }).skip(offset).limit(limit),
        EmailLog.countDocuments(filter),
      ])
      res.json({ items, total, limit, offset })
    } catch (e) { next(e) }
  },
}
