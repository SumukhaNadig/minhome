import { z } from 'zod'

export const createTransactionBody = z.object({
  address: z.string().min(1).max(500),
  status: z.enum(['active', 'closed', 'cancelled']).optional(),
})

export const updateTransactionBody = z.object({
  address: z.string().min(1).max(500).optional(),
  status: z.enum(['active', 'closed', 'cancelled']).optional(),
})

export const listTransactionsQuery = z.object({
  status: z.enum(['active', 'closed', 'cancelled']).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})
