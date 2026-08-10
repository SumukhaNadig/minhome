import { Customer } from '../models/Customer'
import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'

export async function makeCustomer(name = 'Test Realty') {
  return Customer.create({ name })
}

export async function makeTxn(
  overrides: Partial<{ address: string; status: string; customerId: any }> = {},
) {
  const customerId = overrides.customerId ?? (await makeCustomer())._id
  return Transaction.create({
    customerId,
    address: overrides.address ?? '123 Test St',
    status: overrides.status ?? 'active',
  })
}

export async function makeSot(transactionId: any, fields: Record<string, unknown> = {}) {
  return SourceOfTruth.create({ transactionId, fields })
}
