import { sourceOfTruthService } from '../services/sourceOfTruthService'
import { SourceOfTruth } from '../models/SourceOfTruth'
import { makeTxn } from './helpers'

describe('sourceOfTruthService.applyChanges', () => {
  it('creates SOT if missing and applies changes, returning diff', async () => {
    const txn = await makeTxn()
    const diff = await sourceOfTruthService.applyChanges(txn._id.toString(), [
      { key: 'purchasePrice', value: 500000 },
      { key: 'agentName', value: 'Alice' },
    ])
    expect(diff).toHaveLength(2)
    expect(diff[0]).toMatchObject({ key: 'purchasePrice', oldValue: undefined, newValue: 500000 })
    const stored = await SourceOfTruth.findOne({ transactionId: txn._id })
    expect(stored?.fields?.purchasePrice).toBe(500000)
  })

  it('returns only actually-changed keys, dropping no-ops', async () => {
    const txn = await makeTxn()
    await sourceOfTruthService.applyChanges(txn._id.toString(), [{ key: 'agentName', value: 'Alice' }])
    const diff = await sourceOfTruthService.applyChanges(txn._id.toString(), [
      { key: 'agentName', value: 'Alice' }, // no-op
      { key: 'agentEmail', value: 'alice@x.com' },
    ])
    expect(diff).toHaveLength(1)
    expect(diff[0].key).toBe('agentEmail')
  })

  it('rejects unknown SOT keys', async () => {
    const txn = await makeTxn()
    await expect(
      sourceOfTruthService.applyChanges(txn._id.toString(), [{ key: 'bogus', value: 1 }]),
    ).rejects.toThrow(/unknown sot key/i)
  })
})
