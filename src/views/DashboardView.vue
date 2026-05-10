<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="nb-card-sm p-4 nb-card-accent-emerald">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Penjualan Hari Ini</p>
                <p class="text-xl font-black text-[#111] mt-1">{{ formatCurrency(stats.todaySales) }}</p>
              </div>
              <div class="w-10 h-10 bg-[#4ADE80] rounded flex items-center justify-center border-2 border-[#111] shrink-0">
                <svg class="w-5 h-5 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-500 mt-2">{{ stats.todayTransactions }} transaksi</p>
          </div>

          <div class="nb-card-sm p-4 nb-card-accent-blue">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Produk</p>
                <p class="text-xl font-black text-[#111] mt-1">{{ productStore.products.length }}</p>
              </div>
              <div class="w-10 h-10 bg-[#60A5FA] rounded flex items-center justify-center border-2 border-[#111] shrink-0">
                <svg class="w-5 h-5 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-500 mt-2">{{ productStore.categories.length }} kategori</p>
          </div>

          <div class="nb-card-sm p-4 nb-card-accent-red">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stok Menipis</p>
                <p class="text-xl font-black text-[#F87171] mt-1">{{ productStore.lowStockCount }}</p>
              </div>
              <div class="w-10 h-10 bg-[#F87171] rounded flex items-center justify-center border-2 border-[#111] shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <router-link to="/alerts" class="text-xs font-bold text-[#111] mt-2 inline-block hover:underline">
              Lihat detail ->
            </router-link>
          </div>

          <div class="nb-card-sm p-4 nb-card-accent-purple">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Penjualan Bulan Ini</p>
                <p class="text-xl font-black text-[#111] mt-1">{{ formatCurrency(stats.monthlySales) }}</p>
              </div>
              <div class="w-10 h-10 bg-[#C084FC] rounded flex items-center justify-center border-2 border-[#111] shrink-0">
                <svg class="w-5 h-5 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-500 mt-2">{{ stats.monthlyTransactions }} transaksi</p>
          </div>
        </div>

        <div v-if="lowStock.length > 0" class="nb-card-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-black text-sm uppercase tracking-wide">Peringatan Stok Menipis</h4>
            <router-link to="/alerts" class="nb-btn nb-btn-sm nb-btn-primary">Lihat Semua</router-link>
          </div>
          <div class="space-y-2">
            <div
              v-for="item in lowStock.slice(0, 5)"
              :key="item.id"
              class="flex items-center justify-between p-3 rounded border-l-8"
              :class="
                item.alert_level === 'habis'
                  ? 'bg-[#FEE2E2] border-[#F87171] border-2'
                  : item.alert_level === 'kritis'
                  ? 'bg-[#FFF7ED] border-[#FB923C] border-2'
                  : 'bg-[#FEFCE8] border-[#FFE600] border-2'
              "
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full border-2 border-[#111]"
                  :class="
                    item.alert_level === 'habis'
                      ? 'bg-[#F87171]'
                      : item.alert_level === 'kritis'
                      ? 'bg-[#FB923C]'
                      : 'bg-[#FFE600]'
                  "
                ></div>
                <div>
                  <p class="font-black text-sm text-[#111]">{{ item.name }}</p>
                  <p class="text-[10px] font-semibold text-gray-500">{{ item.category_name || '-' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-black text-base" :class="
                  item.alert_level === 'habis' ? 'text-[#F87171]' : item.alert_level === 'kritis' ? 'text-[#FB923C]' : 'text-[#D4A017]'
                ">
                  {{ item.stock }} / {{ item.min_stock }}
                </p>
                <p class="text-[10px] font-bold uppercase text-gray-500">{{ item.alert_level }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="nb-card-sm">
          <div class="p-4 border-b-3 border-[#111] flex items-center justify-between">
            <h4 class="font-black text-sm uppercase tracking-wide">Transaksi Terakhir</h4>
            <router-link to="/transactions" class="nb-btn nb-btn-sm nb-btn-primary">Lihat Semua</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="nb-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in recentTransactions" :key="tx.id">
                  <td class="font-bold text-[#818CF8] font-mono">{{ tx.invoice_number }}</td>
                  <td class="font-semibold">{{ formatCurrency(tx.total_amount) }}</td>
                  <td>
                    <span class="nb-badge" :class="
                      tx.payment_method === 'cash' ? 'nb-badge-green' : tx.payment_method === 'card' ? 'nb-badge-blue' : 'nb-badge-purple'
                    ">
                      {{ tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method === 'card' ? 'Kartu' : 'QRIS' }}
                    </span>
                  </td>
                  <td class="text-gray-500 font-medium">{{ formatDate(tx.created_at) }}</td>
                </tr>
                <tr v-if="recentTransactions.length === 0">
                  <td colspan="4" class="py-10 text-center text-gray-400 font-bold">Belum ada transaksi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useTransactionStore } from '@/stores/transaction'
import type { Transaction, LowStockProduct } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { sendLowStockAlert } from '@/lib/telegram'

const productStore = useProductStore()
const transactionStore = useTransactionStore()

const stats = ref({
  todaySales: 0,
  todayTransactions: 0,
  monthlySales: 0,
  monthlyTransactions: 0,
})
const lowStock = ref<LowStockProduct[]>([])
const recentTransactions = ref<Transaction[]>([])

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories(),
    transactionStore.fetchTransactions(),
  ])

  const today = new Date().toISOString().split('T')[0] || ''
  const month = today.slice(0, 7)

  const [daily, monthly] = await Promise.all([
    transactionStore.getDailySales(today),
    transactionStore.getMonthlySales(month),
  ])

  stats.value = {
    todaySales: daily.total,
    todayTransactions: daily.count,
    monthlySales: monthly.total,
    monthlyTransactions: monthly.count,
  }

  const { data } = await productStore.fetchLowStockProducts()
  if (data) lowStock.value = data

  const { data: toAlert } = await productStore.fetchLowStockProductsToAlert()
  if (toAlert && toAlert.length > 0) {
    await sendLowStockAlert(toAlert)
    for (const p of toAlert) {
      await productStore.markAlerted(p.id)
    }
  }

  recentTransactions.value = transactionStore.transactions.slice(0, 5)
})
</script>
