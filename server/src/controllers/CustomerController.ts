import { Request, Response, NextFunction } from 'express'
import { Customer } from '../models/Customer'

export const CustomerController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await Customer.find().sort({ name: 1 }))
    } catch (e) { next(e) }
  },
}
