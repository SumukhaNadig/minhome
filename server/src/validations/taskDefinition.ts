import { z } from 'zod'
import { PREDICATE_OPS, ACTION_TYPES } from '../models/TaskDefinition'
import { objectId } from './common'

const predicate = z.object({
  key: z.string().min(1),
  op: z.enum(PREDICATE_OPS as unknown as [string, ...string[]]),
  value: z.any().optional(),
})

const action = z.object({
  type: z.enum(ACTION_TYPES as unknown as [string, ...string[]]),
  config: z.any().default({}),
})

export const createTaskDefinitionBody = z.object({
  customerId: objectId,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  watchedKeys: z.array(z.string()).default([]),
  predicates: z.array(predicate).default([]),
  actions: z.array(action).default([]),
  enabled: z.boolean().default(true),
})

export const updateTaskDefinitionBody = createTaskDefinitionBody.partial()

export const listTaskDefinitionsQuery = z.object({
  customerId: objectId.optional(),
})
