import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose'

const changeSchema = new Schema(
  { key: String, oldValue: Schema.Types.Mixed, newValue: Schema.Types.Mixed },
  { _id: false },
)

const auditLogEntrySchema = new Schema(
  {
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    occurredAt: { type: Date, default: Date.now },
    actor: { type: String, required: true },
    changes: { type: [changeSchema], required: true },
  },
  { timestamps: false },
)

auditLogEntrySchema.index({ transactionId: 1, occurredAt: -1 })

export type AuditLogEntryDoc = HydratedDocument<InferSchemaType<typeof auditLogEntrySchema>>

export const AuditLogEntry = model('AuditLogEntry', auditLogEntrySchema)
