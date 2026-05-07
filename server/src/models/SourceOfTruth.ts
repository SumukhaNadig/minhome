import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose'
import { SOT_FIELD_KEYS } from '../config/sotSchema'

const sotFields = SOT_FIELD_KEYS.reduce<Record<string, any>>((acc, key) => {
  acc[key] = Schema.Types.Mixed
  return acc
}, {})

const sourceOfTruthSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,
      index: true,
    },
    fields: { type: new Schema(sotFields, { _id: false }), default: () => ({}) },
  },
  { timestamps: true },
)

export type SourceOfTruthDoc = HydratedDocument<InferSchemaType<typeof sourceOfTruthSchema>>

export const SourceOfTruth = model('SourceOfTruth', sourceOfTruthSchema)

export type SotChange = {
  key: string
  oldValue: unknown
  newValue: unknown
}
