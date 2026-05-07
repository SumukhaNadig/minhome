import { taskService } from '../services/taskService'
import { TaskDefinition } from '../models/TaskDefinition'
import { TaskExecution } from '../models/TaskExecution'
import { EmailLog } from '../models/EmailLog'
import { Transaction } from '../models/Transaction'
import { makeTxn, makeSot } from './helpers'

async function makeDef(partial: Partial<any>) {
  return TaskDefinition.create({ name: 'T', enabled: true, watchedKeys: [], predicates: [], actions: [], ...partial })
}

describe('taskService.evaluate', () => {
  it('skips when no changes provided', async () => {
    const txn = await makeTxn()
    await makeSot(txn._id, {})
    await taskService.evaluate(txn._id.toString(), [])
    expect(await TaskExecution.countDocuments()).toBe(0)
  })

  it('only loads tasks whose watchedKeys overlap changes', async () => {
    const txn = await makeTxn()
    await makeSot(txn._id, { purchasePrice: 1500000 })
    await makeDef({ name: 'matches', watchedKeys: ['purchasePrice'], actions: [{ type: 'setFlag', config: { flagName: 'h', value: true } }] })
    await makeDef({ name: 'no-match', watchedKeys: ['agentEmail'], actions: [{ type: 'setFlag', config: { flagName: 'x', value: true } }] })

    await taskService.evaluate(txn._id.toString(), [{ key: 'purchasePrice', oldValue: 0, newValue: 1500000 }])

    const updated = await Transaction.findById(txn._id)
    expect(updated?.flags?.get('h')).toBe(true)
    expect(updated?.flags?.get('x')).toBeUndefined()
  })

  it('evaluates predicates against current SOT and only fires when all pass', async () => {
    const txn = await makeTxn()
    await makeSot(txn._id, { purchasePrice: 500000 })
    await makeDef({
      name: 'high-value',
      watchedKeys: ['purchasePrice'],
      predicates: [{ key: 'purchasePrice', op: 'gte', value: 1000000 }],
      actions: [{ type: 'setFlag', config: { flagName: 'highValue', value: true } }],
    })

    await taskService.evaluate(txn._id.toString(), [{ key: 'purchasePrice', oldValue: 0, newValue: 500000 }])
    const after = await Transaction.findById(txn._id)
    expect(after?.flags?.get('highValue')).toBeUndefined()
  })

  it('persists a TaskExecution with triggeringChanges and actionResults', async () => {
    const txn = await makeTxn()
    await makeSot(txn._id, { purchasePrice: 1500000, agentEmail: 'a@x.com' })
    const def = await makeDef({
      name: 'big',
      watchedKeys: ['purchasePrice'],
      predicates: [{ key: 'purchasePrice', op: 'gt', value: 1000000 }, { key: 'agentEmail', op: 'exists' }],
      actions: [{ type: 'sendEmail', config: { to: '{{agentEmail}}', subject: 'Hi', body: 'b' } }],
    })

    const changes = [{ key: 'purchasePrice', oldValue: 0, newValue: 1500000 }]
    await taskService.evaluate(txn._id.toString(), changes)

    expect(await EmailLog.countDocuments()).toBe(1)
    const exec = await TaskExecution.findOne({ taskDefinitionId: def._id })
    expect(exec?.triggeringChanges).toHaveLength(1)
    expect(exec?.actionResults?.[0]?.status).toBe('ok')
  })

  it('accepts multi-change input (the batch shape) without changing behavior', async () => {
    const txn = await makeTxn()
    await makeSot(txn._id, { purchasePrice: 2000000, financingType: 'cash' })
    await makeDef({
      name: 'cash-flag',
      watchedKeys: ['financingType'],
      predicates: [{ key: 'financingType', op: 'eq', value: 'cash' }],
      actions: [{ type: 'setFlag', config: { flagName: 'cashDeal', value: true } }],
    })
    await makeDef({
      name: 'big-flag',
      watchedKeys: ['purchasePrice'],
      predicates: [{ key: 'purchasePrice', op: 'gte', value: 1000000 }],
      actions: [{ type: 'setFlag', config: { flagName: 'highValue', value: true } }],
    })

    await taskService.evaluate(txn._id.toString(), [
      { key: 'purchasePrice', oldValue: 0, newValue: 2000000 },
      { key: 'financingType', oldValue: undefined, newValue: 'cash' },
    ])

    const after = await Transaction.findById(txn._id)
    expect(after?.flags?.get('cashDeal')).toBe(true)
    expect(after?.flags?.get('highValue')).toBe(true)
    expect(await TaskExecution.countDocuments()).toBe(2)
  })
})
