export type SotFieldType = 'string' | 'number' | 'date' | 'enum'
export type SotFieldDef = { key: string; label: string; type: SotFieldType; enumValues?: string[] }

export const SOT_FIELDS: SotFieldDef[] = [
  { key: 'propertyAddress', label: 'Property Address', type: 'string' },
  { key: 'purchasePrice', label: 'Purchase Price', type: 'number' },
  { key: 'closingDate', label: 'Closing Date', type: 'date' },
  { key: 'buyerName', label: 'Buyer Name', type: 'string' },
  { key: 'sellerName', label: 'Seller Name', type: 'string' },
  { key: 'agentName', label: 'Agent Name', type: 'string' },
  { key: 'agentEmail', label: 'Agent Email', type: 'string' },
  { key: 'inspectionStatus', label: 'Inspection Status', type: 'enum', enumValues: ['pending','scheduled','complete','failed'] },
  { key: 'financingType', label: 'Financing Type', type: 'enum', enumValues: ['cash','conventional','fha','va'] },
  { key: 'earnestMoneyAmount', label: 'Earnest Money Amount', type: 'number' },
  { key: 'titleCompany', label: 'Title Company', type: 'string' },
  { key: 'notes', label: 'Notes', type: 'string' },
]

export type Txn = {
  _id: string
  address: string
  status: 'active' | 'closed' | 'cancelled'
  flags?: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export type Sot = {
  _id: string
  transactionId: string
  fields: Record<string, unknown>
  updatedAt: string
}

export type AuditEntry = {
  _id: string
  transactionId: string
  occurredAt: string
  actor: string
  changes: Array<{ key: string; oldValue: unknown; newValue: unknown }>
}

export type TaskExec = {
  _id: string
  taskDefinitionId: string | { _id: string; name: string }
  transactionId: string
  executedAt: string
  triggeringChanges: Array<{ key: string; oldValue: unknown; newValue: unknown }>
  actionResults: Array<{ type: string; status: 'ok' | 'failed'; detail?: string }>
}

export type TaskDef = {
  _id: string
  name: string
  description: string
  watchedKeys: string[]
  predicates: Array<{ key: string; op: string; value?: unknown }>
  actions: Array<{ type: 'sendEmail' | 'setFlag' | 'createNote'; config: any }>
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type EmailLogEntry = {
  _id: string
  to: string
  subject: string
  body: string
  sentAt: string
  taskDefinitionId?: string
  transactionId?: string
}

export type Note = {
  _id: string
  transactionId: string
  body: string
  createdAt: string
  source: 'task' | 'manual'
  taskDefinitionId?: string
}

export type Paginated<T> = { items: T[]; total: number; limit: number; offset: number }
