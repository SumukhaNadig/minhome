import { TaskDefinition, TaskDefinitionDoc, PREDICATE_OPS } from '../models/TaskDefinition'
import { TaskExecution } from '../models/TaskExecution'
import { Transaction } from '../models/Transaction'
import { SourceOfTruth, SotChange } from '../models/SourceOfTruth'
import { dispatch, ActionContext, ActionResult } from './taskActions'
import { NotFoundError } from '../errors'

type PredicateOp = (typeof PREDICATE_OPS)[number]

function evalPredicate(op: PredicateOp, fieldValue: unknown, predicateValue: unknown): boolean {
  switch (op) {
    case 'eq': return fieldValue === predicateValue
    case 'ne': return fieldValue !== predicateValue
    case 'gt': return typeof fieldValue === 'number' && typeof predicateValue === 'number' && fieldValue > predicateValue
    case 'gte': return typeof fieldValue === 'number' && typeof predicateValue === 'number' && fieldValue >= predicateValue
    case 'lt': return typeof fieldValue === 'number' && typeof predicateValue === 'number' && fieldValue < predicateValue
    case 'lte': return typeof fieldValue === 'number' && typeof predicateValue === 'number' && fieldValue <= predicateValue
    case 'exists': return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
    case 'notExists': return fieldValue === undefined || fieldValue === null || fieldValue === ''
    default: return false
  }
}

function predicatesPass(def: TaskDefinitionDoc, fields: Record<string, unknown>): boolean {
  for (const p of def.predicates ?? []) {
    if (!evalPredicate(p.op as PredicateOp, fields[p.key], p.value)) return false
  }
  return true
}

export const taskService = {
  async evaluate(transactionId: string, changes: SotChange[]): Promise<void> {
    if (changes.length === 0) return

    const transaction = await Transaction.findById(transactionId)
    if (!transaction) throw new NotFoundError('Transaction', transactionId)

    const sot = await SourceOfTruth.findOne({ transactionId })
    if (!sot) return

    const changedKeys = changes.map(c => c.key)
    const candidates = await TaskDefinition.find({
      customerId: transaction.customerId,
      enabled: true,
      watchedKeys: { $in: changedKeys },
    })

    const fields = (sot.fields ?? {}) as Record<string, unknown>

    for (const def of candidates) {
      if (!predicatesPass(def, fields)) continue
      const ctx: ActionContext = { transaction, sot, taskDefinition: def, triggeringChanges: changes }
      const actionResults: ActionResult[] = []
      for (const action of def.actions ?? []) {
        actionResults.push(await dispatch(action as any, ctx))
      }
      await TaskExecution.create({
        taskDefinitionId: def._id,
        transactionId: transaction._id,
        executedAt: new Date(),
        triggeringChanges: changes,
        actionResults,
      })
    }
  },
}
