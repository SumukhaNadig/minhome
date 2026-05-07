import { Transaction } from '../../models/Transaction'
import type { ActionContext, ActionResult } from './index'

type Config = { flagName: string; value: boolean }

export async function setFlag(config: Config, ctx: ActionContext): Promise<ActionResult> {
  if (!config?.flagName || typeof config?.value !== 'boolean') {
    throw new Error('setFlag config requires flagName and boolean value')
  }
  await Transaction.findByIdAndUpdate(ctx.transaction._id, {
    $set: { [`flags.${config.flagName}`]: config.value },
  })
  return { type: 'setFlag', status: 'ok' }
}
