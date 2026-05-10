<template>
  <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-80px)] animate-fade-in">
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <div class="flex-1">
          <input v-model="search" type="text" placeholder="Cari produk..." class="nb-input" />
        </div>
        <select v-model="selectedCategory" class="nb-input sm:w-48">
          <option value="">Semua Kategori</option>
          <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="flex-1 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            class="nb-card-sm p-3 text-left flex flex-col h-full"
            :class="product.stock <= 0 ? 'opacity-50 border-dashed cursor-not-allowed grayscale' : 'cursor-pointer'"
            :disabled="product.stock <= 0"
            @click="addToCart(product)"
          >
            <div class="w-full aspect-square bg-[#F5F5F0] border-2 border-[#111] rounded flex items-center justify-center mb-2">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="font-bold text-sm text-[#111] truncate">{{ product.name }}</p>
            <p class="font-black text-[#111] mt-auto pt-2">{{ formatCurrency(product.price) }}</p>
            <p class="text-xs font-semibold mt-1" :class="product.stock <= 10 ? 'text-[#F87171]' : 'text-gray-500'">
              Stok: {{ product.stock }}
            </p>
          </button>
        </div>

        <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-16">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="font-bold text-gray-400">Produk tidak ditemukan</p>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-96 flex flex-col nb-card border-l-0 lg:border-l-3 h-[50vh] lg:h-[calc(100vh-80px)] lg:sticky lg:top-20">
      <div class="p-4 border-b-3 border-[#111] bg-[#F5F5F0]">
        <h3 class="font-black text-base tracking-wide uppercase">Keranjang</h3>
        <p class="text-xs font-semibold text-gray-500">{{ cartStore.totalItems }} item</p>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div
          v-for="item in cartStore.items"
          :key="item.product.id"
          class="flex items-center gap-2 p-2 border-2 border-[#111] rounded bg-white"
        >
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm truncate">{{ item.product.name }}</p>
            <p class="text-xs font-semibold text-gray-500">{{ formatCurrency(item.product.price) }}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button class="nb-qty-btn" @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)">-</button>
            <span class="w-8 text-center font-black text-sm">{{ item.quantity }}</span>
            <button class="nb-qty-btn" @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)">+</button>
          </div>
          <p class="font-black text-sm w-20 text-right">{{ formatCurrency(item.product.price * item.quantity) }}</p>
          <button class="text-[#F87171] hover:text-[#dc2626] font-black ml-1" @click="cartStore.removeFromCart(item.product.id)">x</button>
        </div>

        <div v-if="cartStore.items.length === 0" class="flex flex-col items-center justify-center py-10">
          <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p class="font-bold text-gray-400 text-sm">Keranjang kosong</p>
        </div>
      </div>

      <div class="border-t-4 border-[#111] bg-[#FFE600] p-4 space-y-3">
        <div class="space-y-2">
          <input v-model="cartStore.cashierName" placeholder="Nama kasir" class="nb-input bg-white" />
          <div class="nb-badge nb-badge-green text-sm font-bold justify-center">Tunai</div>
          <input
            v-model.number="amountPaidInput"
            type="number"
            placeholder="Jumlah bayar"
            class="nb-input bg-white text-lg font-bold"
          />
        </div>

        <div class="flex justify-between items-center pt-2 border-t-3 border-[#111]">
          <span class="font-black text-base">Total</span>
          <span class="font-black text-xl">{{ formatCurrency(cartStore.totalAmount) }}</span>
        </div>

        <div v-if="cartStore.amountPaid >= cartStore.totalAmount && cartStore.items.length > 0" class="flex justify-between items-center">
          <span class="font-bold text-green-700">Kembalian</span>
          <span class="font-black text-green-700 text-lg">{{ formatCurrency(cartStore.change) }}</span>
        </div>

        <div class="flex gap-2 pt-1">
          <button class="flex-1 nb-btn nb-btn-md nb-btn-secondary" @click="cartStore.clearCart()">
            Batal
          </button>
          <button
            class="flex-1 nb-btn nb-btn-md nb-btn-success"
            :disabled="cartStore.items.length === 0 || cartStore.amountPaid < cartStore.totalAmount"
            @click="handleCheckout"
          >
            Bayar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Struk Pembayaran Modal -->
  <div v-if="receipt.show" class="nb-modal-backdrop" @click.self="closeReceipt">
    <div class="nb-modal w-full max-w-sm mx-4">
      <div v-if="receipt.success" class="p-5">
        <!-- Receipt Header -->
        <div class="text-center border-b-3 border-[#111] pb-4 mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">POS System</h2>
          <p class="text-xs font-semibold text-gray-500">{{ receipt.storeAddress }}</p>
        </div>

          <div class="text-xs font-semibold text-gray-500 mb-3 space-y-1">
            <div class="flex justify-between">
              <span>Invoice</span>
              <span class="font-mono font-black text-[#111]">{{ receipt.data?.invoice_number }}</span>
            </div>
            <canvas id="receipt-barcode" class="mx-auto mt-1 mb-2"></canvas>
            <div class="flex justify-between">
            <span>Tanggal</span>
            <span class="font-black text-[#111]">{{ receipt.date }}</span>
          </div>
          <div v-if="receipt.cashier" class="flex justify-between">
            <span>Kasir</span>
            <span class="font-black text-[#111]">{{ receipt.cashier }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t-2 border-b-2 border-[#111] py-2 mb-3">
          <div v-for="item in receipt.items" :key="item.name" class="flex justify-between py-1 text-sm">
            <div class="flex-1">
              <p class="font-bold truncate max-w-40">{{ item.name }}</p>
              <p class="text-xs text-gray-500">{{ item.qty }} x {{ formatCurrency(item.price) }}</p>
            </div>
            <p class="font-black ml-2">{{ formatCurrency(item.subtotal) }}</p>
          </div>
        </div>

        <!-- Totals -->
        <div class="space-y-1 text-sm mb-4">
          <div class="flex justify-between">
            <span class="font-bold text-gray-500">Total</span>
            <span class="font-black text-lg">{{ formatCurrency(receipt.data?.total_amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-bold text-gray-500">Bayar</span>
            <span class="font-bold">{{ formatCurrency(receipt.data?.amount_paid) }}</span>
          </div>
          <div class="flex justify-between border-t-2 border-[#111] pt-1">
            <span class="font-bold text-green-700">Kembalian</span>
            <span class="font-black text-green-700 text-base">{{ formatCurrency(receipt.data?.change_amount) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center border-t-3 border-[#111] pt-4">
          <p class="text-xs font-bold text-gray-500 mb-2">Terima kasih telah berbelanja</p>
          <div class="flex gap-2">
            <button class="flex-1 nb-btn nb-btn-sm nb-btn-primary" @click="printReceipt">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak
            </button>
            <button class="flex-1 nb-btn nb-btn-sm nb-btn-secondary" @click="closeReceipt">Tutup</button>
          </div>
        </div>
      </div>

      <div v-else class="p-6 text-center">
        <div class="w-20 h-20 bg-[#F87171] border-4 border-[#111] rounded-full flex items-center justify-center mx-auto mb-4 shadow-hard">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 class="text-xl font-black uppercase tracking-wide mb-1">Pembayaran Gagal</h3>
        <p class="text-sm font-semibold text-gray-500 mb-6">{{ receipt.error }}</p>
        <button class="nb-btn nb-btn-md nb-btn-danger nb-btn-block" @click="closeReceipt">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import type { Product, Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import JsBarcode from 'jsbarcode'

const productStore = useProductStore()
const cartStore = useCartStore()
const search = ref('')
const selectedCategory = ref('')
const amountPaidInput = ref(0)

const receipt = ref<{
  show: boolean
  success: boolean
  data: Transaction | null
  items: Array<{ name: string; qty: number; price: number; subtotal: number }>
  cashier: string
  date: string
  storeAddress: string
  error: string
}>({
  show: false,
  success: false,
  data: null,
  items: [],
  cashier: '',
  date: '',
  storeAddress: 'Jl. Contoh No. 123, Kota',
  error: '',
})

function closeReceipt() {
  receipt.value.show = false
}

function printReceipt() {
  const printWin = window.open('', '_blank')
  if (!printWin) return
  const r = receipt.value

  // Render barcode to base64
  const canvas = document.getElementById('receipt-barcode') as HTMLCanvasElement
  const barcodeDataUrl = canvas ? canvas.toDataURL() : ''

  const itemsHtml = r.items.map((i) =>
    `<tr><td>${i.name}</td><td style="text-align:center">${i.qty} x ${formatCurrency(i.price)}</td><td style="text-align:right">${formatCurrency(i.subtotal)}</td></tr>`
  ).join('')
  printWin.document.write(`
    <html><head><title>Struk ${r.data?.invoice_number}</title>
    <style>
      body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
      h2 { text-align: center; font-size: 16px; margin: 0 0 4px 0; }
      .header { text-align: center; font-size: 11px; margin-bottom: 8px; }
      .divider { border-top: 1px dashed #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 2px 0; }
      .total td { font-weight: bold; border-top: 1px dashed #000; padding-top: 4px; }
      .footer { text-align: center; margin-top: 8px; font-size: 11px; }
    </style></head><body>
      <h2>POS System</h2>
      <div class="header">${r.storeAddress}<br>${r.date}${r.cashier ? '<br>Kasir: ' + r.cashier : ''}</div>
      <div class="divider"></div>
      <div style="text-align:center">Invoice: ${r.data?.invoice_number}</div>
      ${barcodeDataUrl ? `<div style="text-align:center"><img src="${barcodeDataUrl}" style="width:180px;height:auto" /></div>` : ''}
      <div class="divider"></div>
      <table>${itemsHtml}</table>
      <div class="divider"></div>
      <table>
        <tr><td><b>Total</b></td><td style="text-align:right"><b>${formatCurrency(r.data?.total_amount)}</b></td></tr>
        <tr><td>Bayar</td><td style="text-align:right">${formatCurrency(r.data?.amount_paid)}</td></tr>
        <tr class="total"><td><b>Kembalian</b></td><td style="text-align:right"><b>${formatCurrency(r.data?.change_amount)}</b></td></tr>
      </table>
      <div class="divider"></div>
      <div class="footer">Terima kasih telah berbelanja</div>
    </body></html>
  `)
  printWin.document.close()
  printWin.print()
}

onMounted(() => {
  productStore.fetchProducts()
  productStore.fetchCategories()
})

watch(amountPaidInput, (val) => {
  cartStore.amountPaid = val || 0
})

const filteredProducts = computed(() => {
  let products = productStore.products.filter((p) => p.is_active)
  if (search.value) {
    const q = search.value.toLowerCase()
    products = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    products = products.filter((p) => p.category_id === selectedCategory.value)
  }
  return products
})

function addToCart(product: Product) {
  if (product.stock <= 0) return
  cartStore.addToCart(product, 1)
}

async function handleCheckout() {
  const { data, error } = await cartStore.checkout()

  if (error || !data) {
    const msg = typeof error === 'string' ? error : error?.message || 'Terjadi kesalahan saat memproses pembayaran'
    receipt.value = { ...receipt.value, show: true, success: false, error: msg }
    return
  }

  receipt.value = {
    show: true,
    success: true,
    data,
    items: cartStore.items.map((i) => ({
      name: i.product.name,
      qty: i.quantity,
      price: i.product.price,
      subtotal: i.product.price * i.quantity,
    })),
    cashier: data.cashier_name || '',
    date: new Date(data.created_at).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    storeAddress: 'Jl. Contoh No. 123, Kota',
    error: '',
  }

  amountPaidInput.value = 0
  productStore.fetchProducts()
  await nextTick()
  const canvas = document.getElementById('receipt-barcode') as HTMLCanvasElement
  if (canvas && receipt.value.data?.invoice_number) {
    JsBarcode(canvas, receipt.value.data.invoice_number, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      background: '#ffffff',
      lineColor: '#111',
      margin: 0,
    })
  }
}
</script>
