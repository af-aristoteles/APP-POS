<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex flex-col sm:flex-row gap-2 items-end">
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1">Dari</label>
            <input v-model="dateStart" type="date" class="nb-input text-sm" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1">Sampai</label>
            <input v-model="dateEnd" type="date" class="nb-input text-sm" />
          </div>
          <button class="nb-btn nb-btn-sm nb-btn-primary shrink-0" @click="loadReport">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filter
          </button>
          <button class="nb-btn nb-btn-sm nb-btn-secondary shrink-0" @click="exportReportCSV">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
          <button class="nb-btn nb-btn-sm nb-btn-secondary shrink-0" @click="printReportPDF">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="nb-card-sm p-4 nb-card-accent-green">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Penjualan</p>
            <p class="text-xl font-black mt-1">{{ formatCurrency(stats.totalSales) }}</p>
            <p class="text-xs font-semibold text-gray-500 mt-1">{{ stats.totalCount }} transaksi</p>
          </div>
          <div class="nb-card-sm p-4 nb-card-accent-blue">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rata-rata / Transaksi</p>
            <p class="text-xl font-black mt-1">{{ formatCurrency(stats.avgTransaction) }}</p>
          </div>
          <div class="nb-card-sm p-4 nb-card-accent-purple">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Item Terjual</p>
            <p class="text-xl font-black mt-1">{{ stats.totalItems }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="nb-card-sm p-4">
            <h4 class="nb-section-title">Top Produk</h4>
            <div class="space-y-2">
              <div
                v-for="(item, index) in topProducts.slice(0, 10)"
                :key="index"
                class="flex items-center gap-2 p-2 border-2 border-[#111] rounded bg-white"
              >
                <span
                  class="w-7 h-7 flex items-center justify-center border-2 border-[#111] rounded font-black text-xs shrink-0"
                  :class="index < 3 ? 'bg-[#FFE600]' : 'bg-[#F5F5F0]'"
                >
                  {{ index + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-xs truncate">{{ item.name }}</p>
                  <div class="nb-progress mt-1">
                    <div
                      class="nb-progress-fill bg-[#818CF8]"
                      :style="{ width: getBarWidth(item.total) + '%' }"
                    ></div>
                  </div>
                </div>
                <span class="nb-badge nb-badge-indigo shrink-0 text-[10px]">{{ item.quantity }}</span>
              </div>
              <div v-if="topProducts.length === 0" class="text-center py-8 text-gray-400 font-bold">
                Belum ada data
              </div>
            </div>
          </div>

          <div class="nb-card-sm p-4">
            <h4 class="nb-section-title">Penjualan per Hari</h4>
            <div class="space-y-3">
              <div v-for="day in dailySales" :key="day.date" class="flex items-center gap-2">
                <span class="w-20 text-[10px] font-bold text-gray-500 shrink-0 text-right">{{ day.label }}</span>
                <div class="flex-1 nb-progress">
                  <div
                    class="nb-progress-fill"
                    :class="maxDaily > 0 && day.total >= maxDaily * 0.7 ? 'nb-progress-fill-green' : maxDaily > 0 && day.total >= maxDaily * 0.4 ? 'nb-progress-fill-yellow' : 'nb-progress-fill-orange'"
                    :style="{ width: maxDaily > 0 ? (day.total / maxDaily) * 100 + '%' : '0%' }"
                  ></div>
                </div>
                <span class="w-24 text-xs font-bold shrink-0">{{ formatCurrency(day.total) }}</span>
              </div>
              <div v-if="dailySales.length === 0" class="text-center py-8 text-gray-400 font-bold">
                Belum ada data
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { supabase } from '@/lib/supabase'
import { formatCurrency, exportCSV, printReport } from '@/lib/utils'

const transactionStore = useTransactionStore()
const topProducts = ref<{ name: string; quantity: number; total: number }[]>([])
const dailySales = ref<{ date: string; label: string; total: number }[]>([])

const maxDaily = computed(() => Math.max(...dailySales.value.map((d) => d.total), 1))

const stats = ref({
  totalSales: 0,
  totalCount: 0,
  avgTransaction: 0,
  totalItems: 0,
})

const today = new Date()
const dateStart = ref(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0] || '')
const dateEnd = ref(today.toISOString().split('T')[0] || '')

function getBarWidth(value: number): number {
  const max = Math.max(...topProducts.value.map((p) => p.total), 1)
  return (value / max) * 100
}

async function loadReport() {
  if (!dateStart.value || !dateEnd.value) return

  const start = `${dateStart.value}T00:00:00`
  const end = `${dateEnd.value}T23:59:59`

  // Stats
  const { data: rangeData } = await supabase
    .from('transactions')
    .select('total_amount')
    .gte('created_at', start)
    .lte('created_at', end)

  const totalSales = rangeData?.reduce((s, t) => s + Number(t.total_amount), 0) || 0
  const totalCount = rangeData?.length || 0
  stats.value = {
    totalSales,
    totalCount,
    avgTransaction: totalCount > 0 ? totalSales / totalCount : 0,
    totalItems: 0,
  }

  // Top products in range
  const { data: items } = await supabase
    .from('transaction_items')
    .select('transaction_id, product_name, quantity, price, transaction:transactions!inner(created_at)')
    .gte('transaction.created_at', start)
    .lte('transaction.created_at', end)

  const productMap: Record<string, { name: string; quantity: number; total: number }> = {}
  let totalQty = 0
  if (items) {
    items.forEach((item: any) => {
      const key = item.product_name || 'unknown'
      if (!productMap[key]) {
        productMap[key] = { name: key, quantity: 0, total: 0 }
      }
      productMap[key].quantity += item.quantity
      productMap[key].total += (item.price || 0) * item.quantity
      totalQty += item.quantity
    })
  }
  topProducts.value = Object.values(productMap).sort((a, b) => b.total - a.total)
  stats.value.totalItems = totalQty

  // Daily sales in range
  const { data: dailyData } = await supabase
    .from('transactions')
    .select('created_at, total_amount')
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: true })

  const dayMap: Record<string, number> = {}
  if (dailyData) {
    dailyData.forEach((t) => {
      const day = new Date(t.created_at).toISOString().split('T')[0] ?? ''
      dayMap[day] = (dayMap[day] || 0) + Number(t.total_amount)
    })
  }

  // Fill in all dates in range
  const startDate = new Date(dateStart.value)
  const endDate = new Date(dateEnd.value)
  dailySales.value = []
  const current = new Date(startDate)
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0] || ''
    dailySales.value.push({
      date: dateStr,
      label: current.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      total: dayMap[dateStr] || 0,
    })
    current.setDate(current.getDate() + 1)
  }
}

function exportReportCSV() {
  const topRows = topProducts.slice(0, 10).map((p) => [
    p.name,
    String(p.quantity),
    String(p.total),
  ])
  const dailyRows = dailySales.map((d) => [
    d.label,
    String(d.total),
  ])

  exportCSV('laporan-' + dateStart.value + '-' + dateEnd.value, [
    'Top Produk', 'Terjual', 'Total',
  ], topRows)
  exportCSV('penjualan-harian-' + dateStart.value + '-' + dateEnd.value, [
    'Tanggal', 'Penjualan',
  ], dailyRows)
}

function printReportPDF() {
  const topRows = topProducts.slice(0, 10).map((p) =>
    `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatCurrency(p.total)}</td></tr>`
  ).join('')
  const dailyRows = dailySales.map((d) =>
    `<tr><td>${d.label}</td><td>${formatCurrency(d.total)}</td></tr>`
  ).join('')

  const content = `
    <h2>Ringkasan Laporan</h2>
    <p>Total: ${formatCurrency(stats.totalSales)} | Transaksi: ${stats.totalCount} | Item: ${stats.totalItems}</p>

    <h3>Top 10 Produk</h3>
    <table>
      <tr><th>Produk</th><th>Terjual</th><th>Total</th></tr>
      ${topRows}
    </table>

    <h3>Penjualan Harian</h3>
    <table>
      <tr><th>Tanggal</th><th>Penjualan</th></tr>
      ${dailyRows}
    </table>
  `
  printReport('Laporan POS - ' + dateStart.value + ' s/d ' + dateEnd.value, content)
}

onMounted(async () => {
  await transactionStore.fetchTransactions()
  await loadReport()
})
</script>
