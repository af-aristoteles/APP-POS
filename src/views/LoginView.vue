<template>
  <div class="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 animate-fade-in">
    <div class="nb-card w-full max-w-md">
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-[#FFE600] rounded-lg flex items-center justify-center border-3 border-[#111] mx-auto mb-4 shadow-hard">
            <svg class="w-8 h-8 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 class="text-2xl font-black uppercase tracking-wide">POS System</h1>
          <p class="text-sm text-gray-500 font-semibold mt-1">Silakan login untuk melanjutkan</p>
        </div>

        <div v-if="authStore.error" class="nb-badge nb-badge-red mb-4 w-full justify-center">
          {{ authStore.error }}
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Email</label>
            <input v-model="email" type="email" required placeholder="email@contoh.com" class="nb-input" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="Masukkan password" class="nb-input pr-10" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111]" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="nb-btn nb-btn-lg nb-btn-primary nb-btn-block" :disabled="authStore.loading">
            <svg v-if="authStore.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ authStore.loading ? 'Memproses...' : 'Login' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/forgot-password" class="text-sm font-bold text-[#111] hover:underline">
            Lupa Password?
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    if (authStore.isAdmin) {
      router.push('/')
    } else {
      router.replace('/pos')
    }
  }
}
</script>
