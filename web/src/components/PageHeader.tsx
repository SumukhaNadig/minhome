import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}

export function PageHeader({ title, subtitle, actions, meta }: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          {meta && <Box sx={{ mt: 1.25 }}>{meta}</Box>}
        </Box>
        {actions && <Box sx={{ pt: 0.5, flexShrink: 0 }}>{actions}</Box>}
      </Stack>
    </Box>
  )
}
