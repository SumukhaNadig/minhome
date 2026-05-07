import type { TransactionDoc } from '../../models/Transaction'
import type { SourceOfTruthDoc, SotChange } from '../../models/SourceOfTruth'
import type { TaskDefinitionDoc } from '../../models/TaskDefinition'
import { sendEmail } from './sendEmail'
import { setFlag } from './setFlag'
import { createNote } from './createNote'

export type ActionContext = {
  transaction: TransactionDoc
  sot: SourceOfTruthDoc
  taskDefinition: TaskDefinitionDoc
  triggeringChanges: SotChange[]
}

export type ActionResult = {
  type: string
  status: 'ok' | 'failed'
  detail?: string
}

export type Action = { type: string; config: any }

const handlers: Record<string, (config: any, ctx: ActionContext) => Promise<ActionResult>> = {
  sendEmail,
  setFlag,
  createNote,
}

export async function dispatch(action: Action, ctx: ActionContext): Promise<ActionResult> {
  const handler = handlers[action.type]
  if (!handler) throw new Error(`Unknown action type: ${action.type}`)
  try {
    return await handler(action.config, ctx)
  } catch (err) {
    return { type: action.type, status: 'failed', detail: (err as Error).message }
  }
}
