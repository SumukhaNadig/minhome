import { useEffect, useState } from 'react'
import {
  Container, Paper, Stack, Button, TextField, MenuItem, IconButton,
  Switch, FormControlLabel, Box, Divider, Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '../api/endpoints'
import { TopBar } from '../components/TopBar'
import { PageHeader } from '../components/PageHeader'
import { SOT_FIELDS } from '../types'

const OPS = ['eq','ne','gt','gte','lt','lte','exists','notExists'] as const
const ACTION_TYPES = ['sendEmail','setFlag','createNote'] as const

type Predicate = { key: string; op: string; value: any }
type Action = { type: 'sendEmail'|'setFlag'|'createNote'; config: any }

const empty = {
  name: '',
  description: '',
  enabled: true,
  watchedKeys: [] as string[],
  predicates: [] as Predicate[],
  actions: [] as Action[],
}

export function TaskDefinitionForm() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState(empty)

  const existing = useQuery({
    queryKey: ['task-definitions', id],
    queryFn: () => endpoints.getTaskDef(id!),
    enabled: !isNew,
  })

  useEffect(() => {
    if (existing.data) {
      setForm({
        name: existing.data.name,
        description: existing.data.description ?? '',
        enabled: existing.data.enabled,
        watchedKeys: existing.data.watchedKeys,
        predicates: existing.data.predicates as Predicate[],
        actions: existing.data.actions as Action[],
      })
    }
  }, [existing.data])

  const save = useMutation({
    mutationFn: () => isNew
      ? endpoints.createTaskDef(form as any)
      : endpoints.updateTaskDef(id!, form as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-definitions'] })
      nav('/task-definitions')
    },
  })

  const remove = useMutation({
    mutationFn: () => endpoints.deleteTaskDef(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-definitions'] })
      nav('/task-definitions')
    },
  })

  const updatePredicate = (i: number, patch: Partial<Predicate>) =>
    setForm(f => ({ ...f, predicates: f.predicates.map((p, idx) => idx === i ? { ...p, ...patch } : p) }))
  const updateAction = (i: number, patch: Partial<Action>) =>
    setForm(f => ({ ...f, actions: f.actions.map((a, idx) => idx === i ? { ...a, ...patch } : a) }))

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 1.5 }}>
          <RouterLink to="/task-definitions" style={{ textDecoration: 'none', color: '#475569', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowBackIcon sx={{ fontSize: 14 }} /> All task definitions
          </RouterLink>
        </Box>
        <PageHeader
          title={isNew ? 'New Task Definition' : 'Edit Task Definition'}
          subtitle={isNew ? 'Configure when this task fires and what it does.' : undefined}
        />
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField label="Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" multiline minRows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel
              control={<Switch checked={form.enabled}
                onChange={e => setForm({ ...form, enabled: e.target.checked })} />}
              label="Enabled"
            />

            <Divider>Watched Keys</Divider>
            <TextField select SelectProps={{ multiple: true,
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(selected as string[]).map(v => <Chip key={v} label={v} size="small" />)}
                  </Box>
                ),
              }}
              label="Watched Keys"
              value={form.watchedKeys}
              onChange={e => setForm({ ...form, watchedKeys: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] })}
            >
              {SOT_FIELDS.map(f => <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>)}
            </TextField>

            <Divider>Predicates (ANDed)</Divider>
            {form.predicates.map((p, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField select size="small" sx={{ minWidth: 180 }} label="Key"
                  value={p.key} onChange={e => updatePredicate(i, { key: e.target.value })}>
                  {SOT_FIELDS.map(f => <MenuItem key={f.key} value={f.key}>{f.key}</MenuItem>)}
                </TextField>
                <TextField select size="small" sx={{ minWidth: 120 }} label="Op"
                  value={p.op} onChange={e => updatePredicate(i, { op: e.target.value })}>
                  {OPS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
                {!['exists','notExists'].includes(p.op) && (
                  <TextField size="small" label="Value" value={p.value ?? ''}
                    onChange={e => updatePredicate(i, { value: e.target.value })} />
                )}
                <IconButton onClick={() => setForm({ ...form, predicates: form.predicates.filter((_, idx) => idx !== i) })}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={() =>
              setForm({ ...form, predicates: [...form.predicates, { key: SOT_FIELDS[0].key, op: 'eq', value: '' }] })}>
              Add Predicate
            </Button>

            <Divider>Actions</Divider>
            {form.actions.map((a, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TextField select size="small" sx={{ minWidth: 160 }} label="Type"
                    value={a.type} onChange={e => updateAction(i, { type: e.target.value as Action['type'], config: {} })}>
                    {ACTION_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton onClick={() => setForm({ ...form, actions: form.actions.filter((_, idx) => idx !== i) })}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                {a.type === 'sendEmail' && (
                  <Stack spacing={1}>
                    <TextField size="small" label="To" value={a.config.to ?? ''}
                      onChange={e => updateAction(i, { config: { ...a.config, to: e.target.value } })} />
                    <TextField size="small" label="Subject" value={a.config.subject ?? ''}
                      onChange={e => updateAction(i, { config: { ...a.config, subject: e.target.value } })} />
                    <TextField size="small" multiline minRows={2} label="Body" value={a.config.body ?? ''}
                      onChange={e => updateAction(i, { config: { ...a.config, body: e.target.value } })} />
                  </Stack>
                )}
                {a.type === 'setFlag' && (
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" label="Flag Name" value={a.config.flagName ?? ''}
                      onChange={e => updateAction(i, { config: { ...a.config, flagName: e.target.value } })} />
                    <FormControlLabel
                      control={<Switch checked={!!a.config.value}
                        onChange={e => updateAction(i, { config: { ...a.config, value: e.target.checked } })} />}
                      label="Value"
                    />
                  </Stack>
                )}
                {a.type === 'createNote' && (
                  <TextField size="small" multiline minRows={2} fullWidth label="Body" value={a.config.body ?? ''}
                    onChange={e => updateAction(i, { config: { ...a.config, body: e.target.value } })} />
                )}
              </Paper>
            ))}
            <Button startIcon={<AddIcon />} onClick={() =>
              setForm({ ...form, actions: [...form.actions, { type: 'sendEmail', config: {} }] })}>
              Add Action
            </Button>

            <Divider />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
                Save
              </Button>
              <Button onClick={() => nav('/task-definitions')}>Cancel</Button>
              {!isNew && (
                <>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button color="error" onClick={() => remove.mutate()}>Delete</Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
