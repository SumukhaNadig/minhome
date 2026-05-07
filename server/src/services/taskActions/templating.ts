export function resolveTemplate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const v = vars[key]
    if (v === undefined || v === null) return ''
    if (v instanceof Date) return v.toISOString()
    return String(v)
  })
}
