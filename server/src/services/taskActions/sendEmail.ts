import { EmailLog } from '../../models/EmailLog'
import { resolveTemplate } from './templating'
import type { ActionContext, ActionResult } from './index'

type Config = { to: string; subject: string; body: string }

export async function sendEmail(config: Config, ctx: ActionContext): Promise<ActionResult> {
  if (!config?.to || !config?.subject || !config?.body) {
    throw new Error('sendEmail config requires to, subject, body')
  }
  const fields = (ctx.sot.fields ?? {}) as Record<string, unknown>
  await EmailLog.create({
    to: resolveTemplate(config.to, fields),
    subject: resolveTemplate(config.subject, fields),
    body: resolveTemplate(config.body, fields),
    sentAt: new Date(),
    taskDefinitionId: ctx.taskDefinition._id,
    transactionId: ctx.transaction._id,
  })
  return { type: 'sendEmail', status: 'ok' }
}
