import { Paper, Typography, Stack, Chip, Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../api/endpoints'
import type { AuditEntry, TaskExec } from '../types'

type Item =
  | { kind: 'audit'; at: string; entry: AuditEntry }
  | { kind: 'exec'; at: string; entry: TaskExec }

export function RecentActivityRail({ transactionId }: { transactionId: string }) {
  const audit = useQuery({
    queryKey: ['transaction', transactionId, 'audit-log'],
    queryFn: () => endpoints.listAudit(transactionId, { limit: 10 }),
  })
  const execs = useQuery({
    queryKey: ['transaction', transactionId, 'task-executions'],
    queryFn: () => endpoints.listExecs(transactionId, { limit: 10 }),
  })

  const items: Item[] = [
    ...(audit.data?.items ?? []).map(e => ({ kind: 'audit' as const, at: e.occurredAt, entry: e })),
    ...(execs.data?.items ?? []).map(e => ({ kind: 'exec' as const, at: e.executedAt, entry: e })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10)

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Recent Activity
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No activity yet. Edit a field to start.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((item, i) => (
            <Box
              key={i}
              sx={{
                pl: 1.5,
                borderLeft: theme => `2px solid ${
                  item.kind === 'audit' ? theme.palette.divider : theme.palette.primary.main
                }`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip
                  size="small"
                  label={item.kind === 'audit' ? 'edit' : 'task'}
                  color={item.kind === 'audit' ? 'default' : 'primary'}
                  variant={item.kind === 'audit' ? 'outlined' : 'filled'}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
              {item.kind === 'audit' ? (
                <Typography variant="body2">
                  <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}>
                    {item.entry.changes.map(c => c.key).join(', ')}
                  </Box>{' '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    ({item.entry.changes.length} change{item.entry.changes.length === 1 ? '' : 's'})
                  </Box>
                </Typography>
              ) : (
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {(typeof item.entry.taskDefinitionId === 'object'
                      ? item.entry.taskDefinitionId.name
                      : item.entry.taskDefinitionId) || 'task'}
                  </Box>{' '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>fired</Box>
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
