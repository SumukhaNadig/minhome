import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {body && <Typography variant="body2" sx={{ mb: 2 }}>{body}</Typography>}
      {action}
    </Box>
  )
}
