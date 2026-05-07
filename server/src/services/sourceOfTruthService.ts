import { SourceOfTruth, SotChange } from '../models/SourceOfTruth'
import { SOT_FIELD_BY_KEY } from '../config/sotSchema'
import { BadRequestError } from '../errors'

export type ChangeRequest = { key: string; value: unknown }

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  return a === b
}

export const sourceOfTruthService = {
  async applyChanges(transactionId: string, changes: ChangeRequest[]): Promise<SotChange[]> {
    for (const c of changes) {
      if (!SOT_FIELD_BY_KEY[c.key]) {
        throw new BadRequestError(`Unknown SOT key: ${c.key}`)
      }
    }

    let sot = await SourceOfTruth.findOne({ transactionId })
    if (!sot) sot = await SourceOfTruth.create({ transactionId, fields: {} })

    const diff: SotChange[] = []
    const fields = (sot.fields ?? {}) as Record<string, unknown>
    for (const c of changes) {
      const oldValue = fields[c.key]
      if (!valuesEqual(oldValue, c.value)) {
        fields[c.key] = c.value
        diff.push({ key: c.key, oldValue, newValue: c.value })
      }
    }
    sot.set('fields', fields)
    sot.markModified('fields')
    await sot.save()
    return diff
  },

  async getByTransactionId(transactionId: string) {
    return SourceOfTruth.findOne({ transactionId })
  },
}
