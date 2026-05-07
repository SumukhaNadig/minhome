import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Container, Box, Paper, Typography, Stack, Tabs, Tab, Grid, Chip, Table, TableHead,
  TableRow, TableCell, TableBody,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '../api/endpoints'
import { TopBar } from '../components/TopBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { SotFieldEditor } from '../components/SotFieldEditor'
import { RecentActivityRail } from '../components/RecentActivityRail'
import { PageHeader } from '../components/PageHeader'
import { SOT_FIELDS } from '../types'
import { transactionStatusColor } from '../utils/status'

type TabKey = 'facts' | 'audit-log' | 'notes'

function tabFromPath(pathname: string): TabKey {
  if (pathname.endsWith('/audit-log')) return 'audit-log'
  if (pathname.endsWith('/notes')) return 'notes'
  return 'facts'
}

function tabPath(id: string, key: TabKey): string {
  if (key === 'facts') return `/transactions/${id}`
  return `/transactions/${id}/${key}`
}

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const loc = useLocation()
  const qc = useQueryClient()
  const tab = tabFromPath(loc.pathname)

  const detail = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => endpoints.getTxn(id!),
    enabled: !!id,
  })

  const audit = useQuery({
    queryKey: ['transaction', id, 'audit-log'],
    queryFn: () => endpoints.listAudit(id!, { limit: 50 }),
    enabled: !!id && tab === 'audit-log',
  })

  const notes = useQuery({
    queryKey: ['transaction', id, 'notes'],
    queryFn: () => endpoints.listNotes(id!, { limit: 50 }),
    enabled: !!id && tab === 'notes',
  })

  const sotMut = useMutation({
    mutationFn: (body: { key: string; value: unknown }) =>
      endpoints.patchSot(id!, [body]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction', id] })
      qc.invalidateQueries({ queryKey: ['transaction', id, 'audit-log'] })
      qc.invalidateQueries({ queryKey: ['transaction', id, 'task-executions'] })
      qc.invalidateQueries({ queryKey: ['transaction', id, 'notes'] })
    },
  })

  if (!id) return null
  if (detail.isLoading) return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}><TopBar /><LoadingSpinner /></Box>
  if (!detail.data) return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}><TopBar /><Typography sx={{ p: 4 }}>Not found.</Typography></Box>

  const { transaction, sourceOfTruth } = detail.data
  const fields = (sourceOfTruth?.fields ?? {}) as Record<string, unknown>
  const activeFlags = Object.entries(transaction.flags ?? {}).filter(([, v]) => v).map(([k]) => k)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 1.5 }}>
          <RouterLink to="/transactions" style={{ textDecoration: 'none', color: '#475569', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowBackIcon sx={{ fontSize: 14 }} /> All transactions
          </RouterLink>
        </Box>

        <PageHeader
          title={transaction.address}
          meta={
            <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
              <Chip
                label={transaction.status}
                size="small"
                color={transactionStatusColor(transaction.status)}
                variant={transaction.status === 'active' ? 'filled' : 'outlined'}
              />
              {activeFlags.map(k => (
                <Chip key={k} label={k} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>
          }
        />

        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v: TabKey) => nav(tabPath(id, v))}
            sx={{ px: 1, borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Tab label="Facts" value="facts" />
            <Tab label="Audit Log" value="audit-log" />
            <Tab label="Notes" value="notes" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {tab === 'facts' && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {SOT_FIELDS.map(field => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <SotFieldEditor
                        field={field}
                        value={fields[field.key]}
                        onCommit={value => sotMut.mutate({ key: field.key, value })}
                        disabled={sotMut.isPending}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {tab === 'audit-log' && (
              <Paper variant="outlined">
                {(audit.data?.items?.length ?? 0) === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No edits yet. Update a field on the Facts tab to record your first audit entry.
                    </Typography>
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Actor</TableCell>
                        <TableCell>Changes</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(audit.data?.items ?? []).map(entry => (
                        <TableRow key={entry._id}>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(entry.occurredAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{entry.actor}</Typography>
                          </TableCell>
                          <TableCell>
                            {entry.changes.map((c, i) => (
                              <Box key={i} sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
                                <Box component="span" sx={{ color: 'text.primary' }}>{c.key}</Box>:{' '}
                                {String(c.oldValue ?? '∅')} → <Box component="span" sx={{ color: 'text.primary' }}>{String(c.newValue ?? '∅')}</Box>
                              </Box>
                            ))}
                          </TableCell>
                          <TableCell align="right">
                            <Chip size="small" label={entry.changes.length} variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            )}

            {tab === 'notes' && (
              <Paper variant="outlined">
                {notes.isLoading ? <LoadingSpinner /> : (notes.data?.items?.length ?? 0) === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No notes yet. Notes are added by tasks (createNote action) when their predicates match.
                    </Typography>
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Body</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(notes.data?.items ?? []).map(note => (
                        <TableRow key={note._id}>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(note.createdAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={note.source}
                              color={note.source === 'task' ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{note.body}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <RecentActivityRail transactionId={id} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
