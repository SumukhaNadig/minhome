import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose'

const noteSchema = new Schema(
  {
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['task', 'manual'], default: 'manual' },
    taskDefinitionId: { type: Schema.Types.ObjectId, ref: 'TaskDefinition' },
  },
  { timestamps: false },
)

noteSchema.index({ transactionId: 1, createdAt: -1 })

export type NoteDoc = HydratedDocument<InferSchemaType<typeof noteSchema>>

export const Note = model('Note', noteSchema)
