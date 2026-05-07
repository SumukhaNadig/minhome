import { Request, Response, NextFunction } from 'express'
import { AuditLogEntry } from '../models/AuditLogEntry'
import { objectIdParam, paginationQuery } from '../validations/common'

export const AuditLogController = {
  async listForTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const { limit = 50, offset = 0 } = paginationQuery.parse(req.query)
      const [items, total] = await Promise.all([
        AuditLogEntry.find({ transactionId: id })
          .sort({ occurredAt: -1 })
          .skip(offset)
          .limit(limit),
        AuditLogEntry.countDocuments({ transactionId: id }),
      ])
      res.json({ items, total, limit, offset })
    } catch (e) { next(e) }
  },
}
