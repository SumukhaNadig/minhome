import { Box, CircularProgress } from '@mui/material'

export function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  )
}
