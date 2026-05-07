import request from 'supertest'
import { buildApp } from '../app'
import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'
import { TaskDefinition } from '../models/TaskDefinition'
import { AuditLogEntry } from '../models/AuditLogEntry'
import { TaskExecution } from '../models/TaskExecution'
import { EmailLog } from '../models/EmailLog'

const app = buildApp()

describe('PATCH /api/transactions/:id/sot', () => {
  it('applies changes, fires task evaluation, and writes audit log', async () => {
    const txn = await Transaction.create({ address: '1 Main' })
    await SourceOfTruth.create({ transactionId: txn._id, fields: {} })

    await TaskDefinition.create({
      name: 'high-value',
      enabled: true,
      watchedKeys: ['purchasePrice'],
      predicates: [{ key: 'purchasePrice', op: 'gte', value: 1000000 }],
      actions: [{ type: 'sendEmail', config: { to: 'staff@x.com', subject: 'big', body: 'b' } }],
    })

    const res = await request(app)
      .patch(`/api/transactions/${txn._id}/sot`)
      .send({ changes: [{ key: 'purchasePrice', value: 1500000 }] })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.changed).toEqual(['purchasePrice'])

    expect(await AuditLogEntry.countDocuments({ transactionId: txn._id })).toBe(1)
    expect(await TaskExecution.countDocuments({ transactionId: txn._id })).toBe(1)
    expect(await EmailLog.countDocuments()).toBe(1)
  })

  it('returns 400 on unknown SOT key', async () => {
    const txn = await Transaction.create({ address: '2 Main' })
    await SourceOfTruth.create({ transactionId: txn._id, fields: {} })

    const res = await request(app)
      .patch(`/api/transactions/${txn._id}/sot`)
      .send({ changes: [{ key: 'bogus', value: 1 }] })

    expect(res.status).toBe(400)
  })
})
