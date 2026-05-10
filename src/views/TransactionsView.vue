<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex items-center gap-3">
          <input v-model="search" placeholder="Cari invoice atau kasir..." class="nb-input flex-1" />
          <span class="nb-badge nb-badge-indigo shrink-0">{{ filteredTransactions.length }}</span>
            <button class="nb-btn nb-btn-sm nb-btn-secondary shrink-0" @click="exportCSVFile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <table class="nb-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Total</th>
              <th>Metode</th>
              <th>Kasir</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id">
              <td class="font-bold font-mono text-[#818CF8]">{{ tx.invoice_number }}</td>
              <td class="font-black">{{ formatCurrency(tx.total_amount) }}</td>
              <td>
                <span class="nb-badge nb-badge-green">Tunai</span>
              </td>
              <td class="font-semibold">{{ tx.cashier_name || '-' }}</td>
              <td class="text-gray-500 font-medium">{{ formatDate(tx.created_at) }}</td>
              <td>
                <button class="nb-btn nb-btn-sm nb-btn-secondary" @click="viewDetails(tx)">Detail</button>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="6" class="py-10 text-center text-gray-400 font-bold">Tidak ada transaksi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedTx" class="nb-modal-backdrop" @click.self="selectedTx = null">
      <div class="nb-modal w-full max-w-lg mx-4">
        <div class="nb-modal-header flex items-center justify-between">
          <h3 class="font-black text-lg uppercase tracking-wide">Detail Transaksi</h3>
          <button class="text-[#111] hover:opacity-70 font-black text-xl" @click="selectedTx = null">&times;</button>
        </div>
        <div class="p-5 space-y-4 max-h-[calc(90vh-60px)] overflow-y-auto">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="font-bold text-gray-500 uppercase text-[10px]">Invoice</p>
              <p class="font-black font-mono text-[#818CF8]">{{ selectedTx.invoice_number }}</p>
            </div>
            <div>
              <p class="font-bold text-gray-500 uppercase text-[10px]">Tanggal</p>
              <p class="font-bold">{{ formatDate(selectedTx.created_at) }}</p>
            </div>
            <div>
              <p class="font-bold text-gray-500 uppercase text-[10px]">Kasir</p>
              <p class="font-bold">{{ selectedTx.cashier_name || '-' }}</p>
            </div>
            <div>
              <p class="font-bold text-gray-500 uppercase text-[10px]">Metode</p>
              <span class="nb-badge" :class="
                selectedTx.payment_method === 'cash' ? 'nb-badge-green' : selectedTx.payment_method === 'card' ? 'nb-badge-blue' : 'nb-badge-purple'
              ">
                {{ selectedTx.payment_method === 'cash' ? 'Tunai' : selectedTx.payment_method === 'card' ? 'Kartu' : 'QRIS' }}
              </span>
            </div>
          </div>

          <div class="border-t-3 border-[#111] pt-4">
            <table class="nb-table !text-sm">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in transactionStore.transactionItems" :key="item.id">
                  <td class="font-bold">{{ item.product_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }}</td>
                  <td class="font-semibold">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-[#FFE600] border-3 border-[#111] rounded p-4 space-y-2">
            <div class="flex justify-between">
              <span class="font-bold">Total</span>
              <span class="font-black">{{ formatCurrency(selectedTx.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold">Dibayar</span>
              <span class="font-black">{{ formatCurrency(selectedTx.amount_paid) }}</span>
            </div>
            <div class="flex justify-between border-t-2 border-[#111] pt-2">
              <span class="font-black">Kembalian</span>
              <span class="font-black text-lg">{{ formatCurrency(selectedTx.change_amount) }}</span>
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
import type { Transaction } from '@/types'
import { formatCurrency, formatDate, exportCSV } from '@/lib/utils'

const transactionStore = useTransactionStore()
const search = ref('')
const selectedTx = ref<Transaction | null>(null)

const filteredTransactions = computed(() => {
  if (!search.value) return transactionStore.transactions
  const q = search.value.toLowerCase()
  return transactionStore.transactions.filter(
    (t) => t.invoice_number.toLowerCase().includes(q) || (t.cashier_name || '').toLowerCase().includes(q)
  )
})

async function viewDetails(tx: Transaction) {
  selectedTx.value = tx
  await transactionStore.fetchTransactionItems(tx.id)
}

function exportCSVFile() {
  const rows = filteredTransactions.value.map((tx) => [
    tx.invoice_number,
    formatDate(tx.created_at),
    String(tx.total_amount),
    String(tx.amount_paid),
    String(tx.change_amount),
    tx.cashier_name || '-',
    'Tunai',
  ])

  exportCSV('transaksi-' + new Date().toISOString().split('T')[0], [
    'Invoice', 'Tanggal', 'Total', 'Bayar', 'Kembalian', 'Kasir', 'Metode',
  ], rows)
}

onMounted(() => {
  transactionStore.fetchTransactions()
})
</script>
