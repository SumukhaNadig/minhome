import { AuditLogEntry } from '../models/AuditLogEntry'
import { SotChange } from '../models/SourceOfTruth'

export const auditLogService = {
  async record(transactionId: string, changes: SotChange[], actor: string): Promise<void> {
    if (changes.length === 0) return
    await AuditLogEntry.create({
      transactionId,
      occurredAt: new Date(),
      actor,
      changes,
    })
  },
}
