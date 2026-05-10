const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

export function formatStockMessage(
  name: string,
  stock: number,
  minStock: number,
  category?: string | null
): string {
  const emoji = stock === 0 ? '🔴' : stock <= minStock * 0.3 ? '🟠' : '🟡'
  const level = stock === 0 ? 'HABIS' : stock <= minStock * 0.3 ? 'KRITIS' : 'MENIPIS'
  return `${emoji} *${name}*
📦 Stok: ${stock} / ${minStock}
📊 Status: *${level}*
${category ? `📂 Kategori: ${category}` : ''}`
}

export async function sendTelegramAlert(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    const data = await response.json()
    if (!data.ok) {
      console.error('Telegram API error:', data.description)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to send Telegram alert:', error)
    return false
  }
}

export async function sendLowStockAlert(
  products: Array<{ name: string; stock: number; min_stock: number; category_name?: string | null }>
): Promise<boolean> {
  if (products.length === 0) return false

  const header = `🚨 *PERINGATAN STOK MENIPIS*\n━━━━━━━━━━━━━━━\n`
  const messages = products.map((p) => formatStockMessage(p.name, p.stock, p.min_stock, p.category_name))
  const footer = `\n━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('id-ID')}`

  const fullMessage = header + messages.join('\n\n') + footer
  return sendTelegramAlert(fullMessage)
}

export async function sendCheckoutAlert(
  invoice: string,
  total: number,
  items: Array<{ name: string; quantity: number }>
): Promise<boolean> {
  const header = `💰 *TRANSAKSI BARU*\n━━━━━━━━━━━━━━━\n`
  const itemsText = items.map((i) => `• ${i.name} x${i.quantity}`).join('\n')
  const footer = `\n━━━━━━━━━━━━━━━\n💵 Total: *Rp ${total.toLocaleString('id-ID')}*\n⏰ ${new Date().toLocaleString('id-ID')}`

  const fullMessage = header + `🧾 Invoice: \`${invoice}\`\n\n${itemsText}` + footer
  return sendTelegramAlert(fullMessage)
}
