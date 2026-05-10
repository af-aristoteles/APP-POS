export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateSKU(name: string): string {
  const prefix = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  const random = Math.floor(Math.random() * 900 + 100)
  return `${prefix}${random}`
}

export function exportCSV(filename: string, headers: string[], rows: string[][]): void {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function printReport(title: string, content: string): void {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      .meta { color: #666; font-size: 11px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f0f0f0; font-size: 11px; }
      .total { font-weight: bold; }
    </style></head><body>
      <h1>${title}</h1>
      <div class="meta">${new Date().toLocaleString('id-ID')}</div>
      ${content}
    </body></html>
  `)
  win.document.close()
  win.print()
}
