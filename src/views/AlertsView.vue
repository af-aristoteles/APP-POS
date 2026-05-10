<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex items-center gap-3">
          <select v-model="filterLevel" class="nb-input sm:w-48">
            <option value="">Semua Level</option>
            <option value="habis">Stok Habis</option>
            <option value="kritis">Kritis</option>
            <option value="menipis">Menipis</option>
          </select>
          <span class="nb-badge" :class="alerts.length > 0 ? 'nb-badge-red' : 'nb-badge-green'">
            {{ alerts.length }} peringatan
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-3">
          <div
            v-for="alert in filteredAlerts"
            :key="alert.id"
            class="nb-card-sm p-3"
            :class="alert.alert_level === 'habis' ? 'border-l-8 border-[#F87171]' : alert.alert_level === 'kritis' ? 'border-l-8 border-[#FB923C]' : 'border-l-8 border-[#FFE600]'"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full border-2 border-[#111] shrink-0"
                  :class="
                    alert.alert_level === 'habis' ? 'bg-[#F87171] animate-pulse-border' :
                    alert.alert_level === 'kritis' ? 'bg-[#FB923C]' : 'bg-[#FFE600]'
                  "
                ></div>
                <div>
                  <p class="font-black text-sm text-[#111]">{{ alert.name }}</p>
                  <p class="text-[10px] font-semibold text-gray-500">{{ alert.category_name || '-' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-center">
                  <p class="text-[9px] font-bold text-gray-500 uppercase">Stok</p>
                  <p class="font-black text-base" :class="
                    alert.alert_level === 'habis' ? 'text-[#F87171]' :
                    alert.alert_level === 'kritis' ? 'text-[#FB923C]' : 'text-[#D4A017]'
                  ">{{ alert.stock }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] font-bold text-gray-500 uppercase">Min</p>
                  <p class="font-black text-base">{{ alert.min_stock }}</p>
                </div>
                <div class="w-24 hidden md:block">
                  <div class="nb-progress">
                    <div
                      class="nb-progress-fill"
                      :class="
                        alert.alert_level === 'habis' ? 'nb-progress-fill-red' :
                        alert.alert_level === 'kritis' ? 'nb-progress-fill-orange' : 'nb-progress-fill-yellow'
                      "
                      :style="{ width: Math.min((alert.stock / alert.min_stock) * 100, 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <router-link to="/products" class="nb-btn nb-btn-sm nb-btn-primary shrink-0">Restock</router-link>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredAlerts.length === 0" class="flex flex-col items-center justify-center py-16">
          <div class="w-14 h-14 bg-[#4ADE80] rounded-full flex items-center justify-center border-3 border-[#111] mb-3">
            <svg class="w-7 h-7 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="font-black text-base text-[#111]">Semua Stok Aman!</p>
          <p class="text-xs text-gray-500 font-semibold mt-1">Tidak ada produk yang memerlukan restock</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import type { LowStockProduct } from '@/types'

const productStore = useProductStore()
const alerts = ref<LowStockProduct[]>([])
const filterLevel = ref('')

const filteredAlerts = computed(() => {
  if (!filterLevel.value) return alerts.value
  return alerts.value.filter((a) => a.alert_level === filterLevel.value)
})

onMounted(async () => {
  await productStore.fetchProducts()
  const { data } = await productStore.fetchLowStockProducts()
  if (data) alerts.value = data
})
</script>
