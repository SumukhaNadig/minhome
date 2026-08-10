import { dispatch, ActionContext } from '../services/taskActions'
import { Customer } from '../models/Customer'
import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'
import { TaskDefinition } from '../models/TaskDefinition'
import { EmailLog } from '../models/EmailLog'
import { Note } from '../models/Note'

async function buildCtx(fields: Record<string, unknown> = {}): Promise<ActionContext> {
  const customer = await Customer.create({ name: 'Test Realty' })
  const transaction = await Transaction.create({ customerId: customer._id, address: '1 Main' })
  const sot = await SourceOfTruth.create({ transactionId: transaction._id, fields })
  const taskDefinition = await TaskDefinition.create({ customerId: customer._id, name: 'T', watchedKeys: [], predicates: [], actions: [] })
  return { transaction, sot, taskDefinition, triggeringChanges: [] }
}

describe('taskActions.dispatch', () => {
  it('sendEmail writes EmailLog and resolves {{templateVars}}', async () => {
    const ctx = await buildCtx({ agentEmail: 'a@x.com', agentName: 'Alice' })
    const result = await dispatch(
      { type: 'sendEmail', config: { to: '{{agentEmail}}', subject: 'Hi {{agentName}}', body: 'Hello' } },
      ctx,
    )
    expect(result).toMatchObject({ type: 'sendEmail', status: 'ok' })
    const logged = await EmailLog.findOne({ to: 'a@x.com' })
    expect(logged?.subject).toBe('Hi Alice')
  })

  it('setFlag updates Transaction.flags', async () => {
    const ctx = await buildCtx()
    const result = await dispatch(
      { type: 'setFlag', config: { flagName: 'highValue', value: true } },
      ctx,
    )
    expect(result.status).toBe('ok')
    const updated = await Transaction.findById(ctx.transaction._id)
    expect(updated?.flags?.get('highValue')).toBe(true)
  })

  it('createNote inserts a Note with source=task and resolves templates', async () => {
    const ctx = await buildCtx({ titleCompany: 'Acme' })
    const result = await dispatch(
      { type: 'createNote', config: { body: 'Title is {{titleCompany}}' } },
      ctx,
    )
    expect(result.status).toBe('ok')
    const note = await Note.findOne({ transactionId: ctx.transaction._id })
    expect(note?.body).toBe('Title is Acme')
    expect(note?.source).toBe('task')
  })

  it('returns failed result when handler throws', async () => {
    const ctx = await buildCtx()
    const result = await dispatch({ type: 'setFlag', config: {} as any }, ctx)
    expect(result.status).toBe('failed')
  })

  it('throws on unknown action type', async () => {
    const ctx = await buildCtx()
    await expect(dispatch({ type: 'nope' as any, config: {} }, ctx)).rejects.toThrow(/unknown action type/i)
  })
})
