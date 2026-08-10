import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'
import { NotFoundError } from '../errors'

export const transactionService = {
  async create(input: {
    customerId: string
    address: string
    status?: 'active' | 'closed' | 'cancelled'
  }) {
    const txn = await Transaction.create(input)
    await SourceOfTruth.create({ transactionId: txn._id, fields: {} })
    return txn
  },

  async list(filter: { customerId?: string; status?: string; limit?: number; offset?: number } = {}) {
    const q: any = {}
    if (filter.customerId) q.customerId = filter.customerId
    if (filter.status) q.status = filter.status
    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200)
    const offset = Math.max(filter.offset ?? 0, 0)
    const [items, total] = await Promise.all([
      Transaction.find(q).sort({ updatedAt: -1 }).skip(offset).limit(limit),
      Transaction.countDocuments(q),
    ])
    return { items, total, limit, offset }
  },

  async getById(id: string) {
    const txn = await Transaction.findById(id)
    if (!txn) throw new NotFoundError('Transaction', id)
    const sot = await SourceOfTruth.findOne({ transactionId: id })
    return { transaction: txn, sourceOfTruth: sot }
  },

  async update(id: string, patch: { address?: string; status?: 'active' | 'closed' | 'cancelled' }) {
    const updated = await Transaction.findByIdAndUpdate(id, { $set: patch }, { new: true })
    if (!updated) throw new NotFoundError('Transaction', id)
    return updated
  },

  async remove(id: string) {
    const deleted = await Transaction.findByIdAndDelete(id)
    if (!deleted) throw new NotFoundError('Transaction', id)
    await SourceOfTruth.deleteOne({ transactionId: id })
  },
}
