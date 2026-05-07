import { Request, Response, NextFunction } from 'express'
import { transactionService } from '../services/transactionService'
import {
  createTransactionBody,
  updateTransactionBody,
  listTransactionsQuery,
} from '../validations/transaction'
import { objectIdParam } from '../validations/common'

export const TransactionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listTransactionsQuery.parse(req.query)
      res.json(await transactionService.list(query))
    } catch (e) { next(e) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createTransactionBody.parse(req.body)
      const txn = await transactionService.create(body)
      res.status(201).json(txn)
    } catch (e) { next(e) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      res.json(await transactionService.getById(id))
    } catch (e) { next(e) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const body = updateTransactionBody.parse(req.body)
      res.json(await transactionService.update(id, body))
    } catch (e) { next(e) }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      await transactionService.remove(id)
      res.status(204).end()
    } catch (e) { next(e) }
  },
}
