<template>
  <aside class="w-64 h-screen bg-[#111] text-white flex flex-col">
    <div class="p-5 border-b-2 border-[#333]">
      <h1 class="text-xl font-black tracking-wide flex items-center gap-2">
        <svg class="w-8 h-8 text-[#FFE600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        POS System
      </h1>
    </div>

    <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nb-nav-item"
        :class="route.path === item.path ? 'nb-nav-item-active' : ''"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        <span class="text-sm font-semibold">{{ item.label }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="ml-auto bg-[#F87171] text-white text-xs font-black px-2 py-0.5 rounded border-2 border-white"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <div class="p-4 border-t-2 border-[#333]">
      <div class="flex items-center gap-3 px-2 mb-3">
        <div class="w-9 h-9 bg-[#FFE600] rounded flex items-center justify-center border-2 border-[#333]">
          <span class="text-sm font-black text-[#111]">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold truncate">{{ authStore.profile?.name }}</p>
          <p class="text-xs text-gray-400">{{ authStore.isAdmin ? 'Admin' : 'Kasir' }}</p>
        </div>
      </div>
      <button class="nb-btn nb-btn-sm nb-btn-danger nb-btn-block" @click="handleLogout">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'

defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const userInitials = computed(() => {
  const name = authStore.profile?.name || ''
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
})

const navItems = computed(() => {
  const all = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/pos', label: 'Kasir / POS', icon: ShoppingCartIcon },
    { path: '/products', label: 'Produk', icon: CubeIcon },
    { path: '/categories', label: 'Kategori', icon: TagIcon },
    { path: '/transactions', label: 'Transaksi', icon: DocumentTextIcon },
    { path: '/reports', label: 'Laporan', icon: ChartBarIcon },
    { path: '/alerts', label: 'Peringatan Stok', icon: ExclamationTriangleIcon, badge: productStore.lowStockCount },
    { path: '/users', label: 'Manajemen User', icon: UserGroupIcon },
    { path: '/profile', label: 'Profile', icon: UserCircleIcon },
  ]

  if (authStore.isAdmin) return all
  return all.filter((item) => ['/pos', '/profile'].includes(item.path))
})

async function handleLogout() {
  await authStore.logout()
  router.replace('/login')
}
</script>
