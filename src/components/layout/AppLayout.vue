<script setup lang="ts">
import { ref, provide } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const mobileOpen = ref(false)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobile() {
  mobileOpen.value = false
}

provide('mobileOpen', mobileOpen)
provide('toggleMobile', toggleMobile)
provide('closeMobile', closeMobile)
</script>

<template>
  <div class="min-h-screen flex bg-[#F5F5F0]">
    <div
      v-if="mobileOpen"
      class="mobile-sidebar-overlay lg:hidden"
      @click="closeMobile"
    />

    <div
      class="fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <Sidebar @close="closeMobile" />
    </div>

    <div class="flex-1 flex flex-col w-full">
      <Header @menu-click="toggleMobile" />
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
