<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <h3 class="font-black text-base uppercase tracking-wide">Profile</h3>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="authStore.error" class="nb-badge nb-badge-red mb-4 w-fit">
          {{ authStore.error }}
        </div>
        <div v-if="successMsg" class="nb-badge nb-badge-green mb-4 w-fit">
          {{ successMsg }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="nb-card-sm p-5">
            <h4 class="font-black text-sm uppercase tracking-wide mb-4">Informasi Profile</h4>

            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 bg-[#FFE600] rounded-lg flex items-center justify-center border-3 border-[#111]">
                <span class="text-xl font-black">{{ userInitials }}</span>
              </div>
              <div>
                <p class="font-black text-lg">{{ authStore.profile?.name }}</p>
                <p class="text-sm text-gray-500 font-semibold">{{ authStore.profile?.email }}</p>
                <span class="nb-badge" :class="authStore.isAdmin ? 'nb-badge-yellow' : 'nb-badge-blue'">
                  {{ authStore.isAdmin ? 'ADMIN' : 'KASIR' }}
                </span>
              </div>
            </div>

            <form class="space-y-3" @submit.prevent="handleUpdateProfile">
              <div>
                <label class="block text-xs font-bold uppercase mb-1">Nama</label>
                <input v-model="nameForm" required class="nb-input" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1">Email</label>
                <input v-model="emailForm" type="email" required class="nb-input" />
              </div>
              <button type="submit" class="nb-btn nb-btn-md nb-btn-primary" :disabled="authStore.loading">
                {{ authStore.loading ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </form>
          </div>

          <div class="nb-card-sm p-5">
            <h4 class="font-black text-sm uppercase tracking-wide mb-4">Ganti Password</h4>

            <form class="space-y-3" @submit.prevent="handleChangePassword">
              <div>
                <label class="block text-xs font-bold uppercase mb-1">Password Lama</label>
                <input v-model="oldPassword" type="password" required class="nb-input" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1">Password Baru</label>
                <input v-model="newPassword" type="password" required minlength="6" class="nb-input" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1">Konfirmasi Password Baru</label>
                <input v-model="confirmNewPassword" type="password" required minlength="6" class="nb-input" />
              </div>
              <div v-if="passwordMismatch" class="nb-badge nb-badge-red w-fit">
                Password baru tidak cocok
              </div>
              <button type="submit" class="nb-btn nb-btn-md nb-btn-secondary" :disabled="authStore.loading">
                {{ authStore.loading ? 'Mengubah...' : 'Ubah Password' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const nameForm = ref('')
const emailForm = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const successMsg = ref('')

const userInitials = computed(() => {
  const name = authStore.profile?.name || ''
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
})

const passwordMismatch = computed(() =>
  newPassword.value && confirmNewPassword.value && newPassword.value !== confirmNewPassword.value
)

onMounted(() => {
  if (authStore.profile) {
    nameForm.value = authStore.profile.name
    emailForm.value = authStore.profile.email
  }
})

async function handleUpdateProfile() {
  successMsg.value = ''
  const ok = await authStore.updateProfileData(nameForm.value, emailForm.value)
  if (ok) successMsg.value = 'Profile berhasil diperbarui'
}

async function handleChangePassword() {
  if (newPassword.value !== confirmNewPassword.value) return
  successMsg.value = ''
  const ok = await authStore.updatePassword(newPassword.value)
  if (ok) {
    successMsg.value = 'Password berhasil diubah'
    oldPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
  }
}
</script>
