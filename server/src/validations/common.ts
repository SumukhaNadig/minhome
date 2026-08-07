import { z } from 'zod'

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid id')

export const objectIdParam = z.object({ id: objectId })

export const paginationQuery = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})
