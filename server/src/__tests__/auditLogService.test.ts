import { auditLogService } from '../services/auditLogService'
import { AuditLogEntry } from '../models/AuditLogEntry'
import { makeTxn } from './helpers'

describe('auditLogService.record', () => {
  it('writes one AuditLogEntry with the given changes array', async () => {
    const txn = await makeTxn()
    await auditLogService.record(txn._id.toString(), [
      { key: 'agentName', oldValue: undefined, newValue: 'Alice' },
    ], 'jane@x.com')

    const all = await AuditLogEntry.find({ transactionId: txn._id })
    expect(all).toHaveLength(1)
    expect(all[0].changes).toHaveLength(1)
    expect(all[0].actor).toBe('jane@x.com')
  })

  it('writes one entry containing N changes when given N (the batch shape)', async () => {
    const txn = await makeTxn()
    await auditLogService.record(txn._id.toString(), [
      { key: 'agentName', oldValue: 'X', newValue: 'Alice' },
      { key: 'agentEmail', oldValue: undefined, newValue: 'a@x.com' },
      { key: 'purchasePrice', oldValue: 0, newValue: 500000 },
    ], 'jane@x.com')

    const all = await AuditLogEntry.find({ transactionId: txn._id })
    expect(all).toHaveLength(1)
    expect(all[0].changes).toHaveLength(3)
  })

  it('is a no-op on empty changes', async () => {
    const txn = await makeTxn()
    await auditLogService.record(txn._id.toString(), [], 'jane@x.com')
    expect(await AuditLogEntry.countDocuments()).toBe(0)
  })
})
