import { Request, Response, NextFunction } from 'express'
import { TaskExecution } from '../models/TaskExecution'
import { objectIdParam, paginationQuery } from '../validations/common'

export const TaskExecutionController = {
  async listForTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const { limit = 50, offset = 0 } = paginationQuery.parse(req.query)
      const [items, total] = await Promise.all([
        TaskExecution.find({ transactionId: id })
          .sort({ executedAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('taskDefinitionId', 'name'),
        TaskExecution.countDocuments({ transactionId: id }),
      ])
      res.json({ items, total, limit, offset })
    } catch (e) { next(e) }
  },
}
