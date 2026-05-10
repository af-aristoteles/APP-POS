<template>
  <div class="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 animate-fade-in">
    <div class="nb-card w-full max-w-md">
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-[#4ADE80] rounded-lg flex items-center justify-center border-3 border-[#111] mx-auto mb-4">
            <svg class="w-8 h-8 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 class="text-2xl font-black uppercase tracking-wide">Reset Password</h1>
          <p class="text-sm text-gray-500 font-semibold mt-1">Masukkan password baru Anda</p>
        </div>

        <div v-if="authStore.error" class="nb-badge nb-badge-red mb-4 w-full justify-center">
          {{ authStore.error }}
        </div>
        <div v-if="success" class="nb-badge nb-badge-green mb-4 w-full justify-center">
          Password berhasil diubah!
        </div>

        <form v-if="!success && ready" class="space-y-4" @submit.prevent="handleReset">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Password Baru</label>
            <input v-model="password" type="password" required minlength="6" placeholder="Minimal 6 karakter" class="nb-input" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Konfirmasi Password</label>
            <input v-model="confirmPassword" type="password" required minlength="6" placeholder="Ulangi password" class="nb-input" />
          </div>
          <div v-if="passwordMismatch" class="nb-badge nb-badge-red w-full justify-center">
            Password tidak cocok
          </div>

          <button type="submit" class="nb-btn nb-btn-lg nb-btn-success nb-btn-block" :disabled="authStore.loading">
            <svg v-if="authStore.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ authStore.loading ? 'Memproses...' : 'Reset Password' }}
          </button>
        </form>

        <div v-if="!ready && !success" class="text-center py-4">
          <svg class="w-8 h-8 animate-spin mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p class="text-sm font-bold text-gray-400 mt-2">Memverifikasi link reset...</p>
        </div>

        <div v-if="success" class="text-center">
          <router-link to="/login" class="nb-btn nb-btn-md nb-btn-primary">Login Sekarang</router-link>
        </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const success = ref(false)
const ready = ref(false)

const passwordMismatch = computed(() =>
  password.value && confirmPassword.value && password.value !== confirmPassword.value
)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    authStore.user = data.session.user
    ready.value = true
  } else {
    authStore.error = 'Link reset tidak valid atau sudah kadaluarsa. Silakan minta link baru.'
  }
})

async function handleReset() {
  if (password.value !== confirmPassword.value) return
  if (!ready.value) return

  authStore.loading = true
  authStore.error = null

  const { error: err } = await supabase.auth.updateUser({
    password: password.value,
  })

  if (err) {
    authStore.error = err.message
    authStore.loading = false
    return
  }

  success.value = true
  authStore.loading = false
}
</script>
