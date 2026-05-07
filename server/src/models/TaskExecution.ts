import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose'

const triggeringChangeSchema = new Schema(
  { key: String, oldValue: Schema.Types.Mixed, newValue: Schema.Types.Mixed },
  { _id: false },
)

const actionResultSchema = new Schema(
  {
    type: { type: String, required: true },
    status: { type: String, enum: ['ok', 'failed'], required: true },
    detail: { type: String },
  },
  { _id: false },
)

const taskExecutionSchema = new Schema(
  {
    taskDefinitionId: { type: Schema.Types.ObjectId, ref: 'TaskDefinition', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    executedAt: { type: Date, default: Date.now },
    triggeringChanges: { type: [triggeringChangeSchema], default: [] },
    actionResults: { type: [actionResultSchema], default: [] },
  },
  { timestamps: false },
)

taskExecutionSchema.index({ transactionId: 1, executedAt: -1 })

export type TaskExecutionDoc = HydratedDocument<InferSchemaType<typeof taskExecutionSchema>>

export const TaskExecution = model('TaskExecution', taskExecutionSchema)
