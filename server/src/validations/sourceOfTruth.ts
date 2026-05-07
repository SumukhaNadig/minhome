import { z } from 'zod'

export const patchSotBody = z.object({
  changes: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.unknown(),
      }),
    )
    .min(1),
})
