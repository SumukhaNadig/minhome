export type SotFieldType = 'string' | 'number' | 'date' | 'enum'

export type SotFieldDef = {
  key: string
  label: string
  type: SotFieldType
  enumValues?: readonly string[]
}

export const SOT_FIELD_SCHEMA: readonly SotFieldDef[] = [
  { key: 'propertyAddress', label: 'Property Address', type: 'string' },
  { key: 'purchasePrice', label: 'Purchase Price', type: 'number' },
  { key: 'closingDate', label: 'Closing Date', type: 'date' },
  { key: 'buyerName', label: 'Buyer Name', type: 'string' },
  { key: 'sellerName', label: 'Seller Name', type: 'string' },
  { key: 'agentName', label: 'Agent Name', type: 'string' },
  { key: 'agentEmail', label: 'Agent Email', type: 'string' },
  {
    key: 'inspectionStatus',
    label: 'Inspection Status',
    type: 'enum',
    enumValues: ['pending', 'scheduled', 'complete', 'failed'] as const,
  },
  {
    key: 'financingType',
    label: 'Financing Type',
    type: 'enum',
    enumValues: ['cash', 'conventional', 'fha', 'va'] as const,
  },
  { key: 'earnestMoneyAmount', label: 'Earnest Money Amount', type: 'number' },
  { key: 'titleCompany', label: 'Title Company', type: 'string' },
  { key: 'notes', label: 'Notes', type: 'string' },
] as const

export const SOT_FIELD_KEYS = SOT_FIELD_SCHEMA.map(f => f.key)

export const SOT_FIELD_BY_KEY = Object.fromEntries(
  SOT_FIELD_SCHEMA.map(f => [f.key, f]),
) as Record<string, SotFieldDef>
