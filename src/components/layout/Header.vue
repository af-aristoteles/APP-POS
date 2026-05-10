<template>
  <header class="bg-white border-b-4 border-[#111] px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
    <div class="flex items-center gap-3">
      <button
        class="lg:hidden nb-btn nb-btn-sm nb-btn-secondary"
        @click="$emit('menu-click')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h2 class="text-base lg:text-lg font-black text-[#111] tracking-wide">{{ pageTitle }}</h2>
    </div>
    <div class="flex items-center gap-3 lg:gap-4">
      <div class="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-500 bg-[#F5F5F0] border-2 border-[#111] rounded px-3 py-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ currentDate }}
      </div>
      <div class="flex items-center gap-2 bg-[#F5F5F0] border-2 border-[#111] rounded px-3 py-1.5">
        <div class="w-7 h-7 bg-[#FFE600] rounded flex items-center justify-center border-2 border-[#111]">
          <span class="text-xs font-black text-[#111]">{{ userInitials }}</span>
        </div>
        <div class="hidden sm:block">
          <p class="text-xs font-bold truncate max-w-24">{{ authStore.profile?.name }}</p>
        </div>
        <span class="nb-badge" :class="authStore.isAdmin ? 'nb-badge-yellow' : 'nb-badge-blue'" style="font-size: 9px; padding: 1px 5px;">
          {{ authStore.isAdmin ? 'ADMIN' : 'KASIR' }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits(['menu-click'])

const route = useRoute()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.profile?.name || ''
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'Kasir / Point of Sale',
  products: 'Manajemen Produk',
  categories: 'Kategori Produk',
  transactions: 'Riwayat Transaksi',
  reports: 'Laporan',
  alerts: 'Peringatan Stok',
  profile: 'Profile',
  users: 'Manajemen User',
}

const pageTitle = computed(() => pageTitles[route.name as string] || 'Dashboard')
const currentDate = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)
</script>
