<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex items-center justify-between">
          <span class="nb-badge nb-badge-blue py-1.5">{{ productStore.categories.length }} kategori</span>
          <button class="nb-btn nb-btn-sm nb-btn-primary" @click="openModal()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="cat in productStore.categories" :key="cat.id" class="nb-card-sm p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="font-black text-base text-[#111] truncate">{{ cat.name }}</h3>
                <p class="text-xs text-gray-500 mt-1 font-medium">{{ cat.description || 'Tidak ada deskripsi' }}</p>
              </div>
              <span class="nb-badge nb-badge-blue shrink-0 ml-2 text-[10px]">
                {{ getProductCount(cat.id) }}
              </span>
            </div>
            <div class="flex gap-2 mt-3 pt-3 border-t-2 border-[#111]">
              <button class="flex-1 nb-btn nb-btn-sm nb-btn-secondary" @click="openModal(cat)">Edit</button>
              <button class="flex-1 nb-btn nb-btn-sm nb-btn-danger" @click="handleDelete(cat.id)">Hapus</button>
            </div>
          </div>
        </div>

        <div v-if="productStore.categories.length === 0" class="flex flex-col items-center justify-center py-16">
          <svg class="w-14 h-14 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p class="font-bold text-gray-400">Belum ada kategori</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="nb-modal-backdrop" @click.self="closeModal">
      <div class="nb-modal w-full max-w-md mx-4">
        <div class="nb-modal-header flex items-center justify-between sticky top-0 z-10">
          <h3 class="font-black text-lg uppercase tracking-wide">{{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
          <button class="text-[#111] hover:opacity-70 font-black text-xl" @click="closeModal">&times;</button>
        </div>
        <form class="p-5 space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Nama Kategori</label>
            <input v-model="form.name" required class="nb-input" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Deskripsi</label>
            <textarea v-model="form.description" rows="3" class="nb-input"></textarea>
          </div>
          <div class="flex gap-3 pt-2 border-t-3 border-[#111]">
            <button type="button" class="flex-1 nb-btn nb-btn-md nb-btn-secondary" @click="closeModal">Batal</button>
            <button type="submit" class="flex-1 nb-btn nb-btn-md nb-btn-primary">{{ editingCategory ? 'Update' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import type { Category } from '@/types'

const productStore = useProductStore()
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)
const form = ref({ name: '', description: '' })

function getProductCount(catId: string) {
  return productStore.products.filter((p) => p.category_id === catId).length
}

function openModal(cat?: Category) {
  if (cat) {
    editingCategory.value = cat
    form.value = { name: cat.name, description: cat.description || '' }
  } else {
    editingCategory.value = null
    form.value = { name: '', description: '' }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function handleSubmit() {
  let error: any
  if (editingCategory.value) {
    const res = await productStore.updateCategory(editingCategory.value.id, form.value)
    error = res.error
  } else {
    const res = await productStore.addCategory(form.value)
    error = res.error
  }
  if (error) {
    alert('Gagal menyimpan kategori: ' + error.message)
    return
  }
  closeModal()
}

async function handleDelete(id: string) {
  if (!confirm('Yakin ingin menghapus kategori ini?')) return
  const error = await productStore.deleteCategory(id)
  if (error) {
    alert('Gagal menghapus kategori: ' + error.message)
  }
}

onMounted(async () => {
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchProducts(),
  ])
})
</script>
