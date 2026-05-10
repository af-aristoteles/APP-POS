<template>
  <div class="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 animate-fade-in">
    <div class="nb-card w-full max-w-md">
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-[#60A5FA] rounded-lg flex items-center justify-center border-3 border-[#111] mx-auto mb-4">
            <svg class="w-8 h-8 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="text-2xl font-black uppercase tracking-wide">Lupa Password</h1>
          <p class="text-sm text-gray-500 font-semibold mt-1">Masukkan email untuk reset password</p>
        </div>

        <div v-if="authStore.error" class="nb-badge nb-badge-red mb-4 w-full justify-center">
          {{ authStore.error }}
        </div>
        <div v-if="success" class="nb-badge nb-badge-green mb-4 w-full justify-center">
          Link reset telah dikirim ke email Anda
        </div>

        <form class="space-y-4" @submit.prevent="handleForgot">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Email</label>
            <input v-model="email" type="email" required placeholder="email@contoh.com" class="nb-input" />
          </div>

          <button type="submit" class="nb-btn nb-btn-lg nb-btn-primary nb-btn-block" :disabled="authStore.loading || success">
            <svg v-if="authStore.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ authStore.loading ? 'Mengirim...' : 'Kirim Link Reset' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm font-bold text-[#111] hover:underline">
            &larr; Kembali ke Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const success = ref(false)

async function handleForgot() {
  const ok = await authStore.forgotPassword(email.value)
  if (ok) success.value = true
}
</script>
