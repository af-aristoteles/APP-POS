<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex flex-col sm:flex-row gap-2">
          <input v-model="search" placeholder="Cari produk..." class="nb-input flex-1" />
          <select v-model="selectedCategory" class="nb-input sm:w-48">
            <option value="">Semua Kategori</option>
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <button class="nb-btn nb-btn-md nb-btn-primary shrink-0" @click="openModal()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Produk
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <table class="nb-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>SKU</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="font-bold">{{ product.name }}</td>
              <td class="font-mono text-sm">{{ product.sku }}</td>
              <td>{{ product.category?.name || '-' }}</td>
              <td class="font-semibold">{{ formatCurrency(product.price) }}</td>
              <td>
                <span class="font-bold" :class="product.stock <= product.min_stock ? 'text-[#F87171] font-black bg-[#FEE2E2] px-2 py-0.5 rounded border-2 border-[#F87171]' : ''">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <span class="nb-badge" :class="product.is_active ? 'nb-badge-green' : 'nb-badge-red'">
                  {{ product.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="nb-btn nb-btn-sm nb-btn-secondary" @click="openModal(product)">Edit</button>
                  <button class="nb-btn nb-btn-sm nb-btn-danger" @click="handleDelete(product.id)">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="7" class="py-10 text-center text-gray-400 font-bold">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Belum ada produk
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="nb-modal-backdrop" @click.self="closeModal">
      <div class="nb-modal w-full max-w-2xl mx-4">
        <div class="nb-modal-header flex items-center justify-between sticky top-0 z-10">
          <h3 class="font-black text-lg uppercase tracking-wide">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>
          <button class="text-[#111] hover:opacity-70 font-black text-xl" @click="closeModal">&times;</button>
        </div>
        <form class="p-5 space-y-4 max-h-[calc(90vh-60px)] overflow-y-auto" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Nama Produk</label>
              <input v-model="form.name" required class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">SKU</label>
              <input v-model="form.sku" required class="nb-input" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Kategori</label>
            <select v-model="form.category_id" class="nb-input">
              <option value="">Tanpa Kategori</option>
              <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Harga Jual</label>
              <input v-model.number="form.price" type="number" required class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Harga Beli</label>
              <input v-model.number="form.cost_price" type="number" required class="nb-input" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Stok</label>
              <input v-model.number="form.stock" type="number" required class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Stok Minimum</label>
              <input v-model.number="form.min_stock" type="number" required class="nb-input" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Deskripsi</label>
            <textarea v-model="form.description" rows="2" class="nb-input"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.is_active" type="checkbox" id="is_active" class="w-4 h-4 border-2 border-[#111]" />
            <label for="is_active" class="font-bold text-sm">Produk Aktif</label>
          </div>
          <div class="flex gap-3 pt-2 border-t-3 border-[#111] sticky bottom-0 bg-white pb-1">
            <button type="button" class="flex-1 nb-btn nb-btn-md nb-btn-secondary" @click="closeModal">Batal</button>
            <button type="submit" class="flex-1 nb-btn nb-btn-md nb-btn-primary">{{ editingProduct ? 'Update' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'

const productStore = useProductStore()
const search = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const editingProduct = ref<Product | null>(null)

const defaultForm = {
  name: '', sku: '', category_id: '', description: '',
  price: 0, cost_price: 0, stock: 0, min_stock: 10, is_active: true,
}

const form = ref({ ...defaultForm })

const filteredProducts = computed(() => {
  let products = productStore.products
  if (search.value) {
    const q = search.value.toLowerCase()
    products = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    products = products.filter((p) => p.category_id === selectedCategory.value)
  }
  return products
})

function openModal(product?: Product) {
  if (product) {
    editingProduct.value = product
    form.value = {
      name: product.name, sku: product.sku, category_id: product.category_id || '',
      description: product.description || '', price: product.price,
      cost_price: product.cost_price, stock: product.stock,
      min_stock: product.min_stock, is_active: product.is_active,
    }
  } else {
    editingProduct.value = null
    form.value = { ...defaultForm }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleSubmit() {
  if (editingProduct.value) {
    await productStore.updateProduct(editingProduct.value.id, form.value)
  } else {
    await productStore.addProduct(form.value as any)
  }
  closeModal()
}

async function handleDelete(id: string) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    await productStore.deleteProduct(id)
  }
}

onMounted(() => {
  productStore.fetchProducts()
  productStore.fetchCategories()
})
</script>
