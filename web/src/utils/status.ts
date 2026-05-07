import type { ChipProps } from '@mui/material'

export function transactionStatusColor(status: string): ChipProps['color'] {
  switch (status) {
    case 'active': return 'success'
    case 'closed': return 'default'
    case 'cancelled': return 'error'
    default: return 'default'
  }
}

export function actionStatusColor(status: string): ChipProps['color'] {
  return status === 'failed' ? 'error' : 'success'
}

export function inspectionStatusColor(status: unknown): ChipProps['color'] {
  switch (status) {
    case 'complete': return 'success'
    case 'scheduled': return 'info'
    case 'pending': return 'warning'
    case 'failed': return 'error'
    default: return 'default'
  }
}
