import { Schema, model, Types, InferSchemaType, HydratedDocument } from 'mongoose'

const transactionSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'cancelled'],
      default: 'active',
      required: true,
    },
    flags: { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true },
)

export type TransactionDoc = HydratedDocument<InferSchemaType<typeof transactionSchema>>
export type TransactionId = Types.ObjectId

export const Transaction = model('Transaction', transactionSchema)
