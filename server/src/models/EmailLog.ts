import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose'

const emailLogSchema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    taskDefinitionId: { type: Schema.Types.ObjectId, ref: 'TaskDefinition' },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', index: true },
  },
  { timestamps: false },
)

emailLogSchema.index({ sentAt: -1 })

export type EmailLogDoc = HydratedDocument<InferSchemaType<typeof emailLogSchema>>

export const EmailLog = model('EmailLog', emailLogSchema)
