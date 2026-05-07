import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'

export async function makeTxn(overrides: Partial<{ address: string; status: string }> = {}) {
  return Transaction.create({
    address: overrides.address ?? '123 Test St',
    status: overrides.status ?? 'active',
  })
}

export async function makeSot(transactionId: any, fields: Record<string, unknown> = {}) {
  return SourceOfTruth.create({ transactionId, fields })
}
