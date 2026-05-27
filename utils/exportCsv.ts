export type CsvRow = Record<string, string | number | null | undefined>

function escapeCsv(value: CsvRow[string]) {
  const text = value === undefined || value === null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadCsv(fileName: string, rows: CsvRow[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(','))
  ].join('\r\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
