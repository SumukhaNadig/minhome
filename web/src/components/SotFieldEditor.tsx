import { useState, useEffect } from 'react'
import { TextField, MenuItem } from '@mui/material'
import type { SotFieldDef } from '../types'

type Props = {
  field: SotFieldDef
  value: unknown
  onCommit: (value: unknown) => void
  disabled?: boolean
}

function toInput(field: SotFieldDef, value: unknown): string {
  if (value === undefined || value === null) return ''
  if (field.type === 'date' && typeof value === 'string') return value.slice(0, 10)
  return String(value)
}

function fromInput(field: SotFieldDef, raw: string): unknown {
  if (raw === '') return undefined
  if (field.type === 'number') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  if (field.type === 'date') return new Date(raw).toISOString()
  return raw
}

export function SotFieldEditor({ field, value, onCommit, disabled }: Props) {
  const [draft, setDraft] = useState(() => toInput(field, value))
  useEffect(() => { setDraft(toInput(field, value)) }, [field, value])

  const commit = () => {
    const parsed = fromInput(field, draft)
    if (parsed !== value) onCommit(parsed)
  }

  if (field.type === 'enum' && field.enumValues) {
    return (
      <TextField
        select
        size="small"
        fullWidth
        label={field.label}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        disabled={disabled}
      >
        <MenuItem value="">—</MenuItem>
        {field.enumValues.map(v => (
          <MenuItem key={v} value={v}>{v}</MenuItem>
        ))}
      </TextField>
    )
  }

  return (
    <TextField
      size="small"
      fullWidth
      label={field.label}
      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      disabled={disabled}
      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
    />
  )
}
