<template>
  <div class="animate-fade-in">
    <div class="nb-card flex flex-col overflow-hidden" style="height: calc(100vh - 140px)">
      <div class="p-3 border-b-3 border-[#111] shrink-0">
        <div class="flex items-center justify-between">
          <span class="nb-badge nb-badge-indigo py-1.5">{{ users.length }} user</span>
          <button class="nb-btn nb-btn-sm nb-btn-primary" @click="openModal()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Tambah User
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <table class="nb-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Tanggal Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-[#FFE600] rounded flex items-center justify-center border-2 border-[#111] text-xs font-black shrink-0">
                    {{ u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }}
                  </div>
                  <span class="font-bold">{{ u.name }}</span>
                </div>
              </td>
              <td class="font-mono text-sm">{{ u.email }}</td>
              <td>
                <span class="nb-badge" :class="u.role === 'admin' ? 'nb-badge-yellow' : 'nb-badge-blue'">
                  {{ u.role === 'admin' ? 'ADMIN' : 'KASIR' }}
                </span>
              </td>
              <td class="text-gray-500 font-medium">{{ formatDate(u.created_at) }}</td>
              <td>
                <div class="flex gap-2">
                  <button class="nb-btn nb-btn-sm nb-btn-secondary" @click="openEditModal(u)">Edit</button>
                  <button
                    v-if="u.id !== authStore.profile?.id"
                    class="nb-btn nb-btn-sm nb-btn-danger"
                    @click="handleDelete(u)"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="flex flex-col items-center justify-center py-16">
          <svg class="w-14 h-14 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="font-bold text-gray-400">Belum ada user</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="nb-modal-backdrop" @click.self="closeModal">
      <div class="nb-modal w-full max-w-md mx-4">
        <div class="nb-modal-header flex items-center justify-between sticky top-0 z-10">
          <h3 class="font-black text-lg uppercase tracking-wide">{{ editingUser ? 'Edit User' : 'Tambah User' }}</h3>
          <button class="text-[#111] hover:opacity-70 font-black text-xl" @click="closeModal">&times;</button>
        </div>

        <div v-if="editingUser" class="p-5 space-y-4">
          <form @submit.prevent="handleUpdateRole">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Role</label>
              <select v-model="roleForm" class="nb-input">
                <option value="admin">Admin</option>
                <option value="kasir">Kasir</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4 border-t-3 border-[#111]">
              <button type="button" class="flex-1 nb-btn nb-btn-md nb-btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="flex-1 nb-btn nb-btn-md nb-btn-primary">Simpan</button>
            </div>
          </form>
        </div>

        <div v-else class="p-5 space-y-4">
          <form @submit.prevent="handleRegister">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Nama</label>
              <input v-model="nameForm" required class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Email</label>
              <input v-model="emailForm" type="email" required class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Password</label>
              <input v-model="passwordForm" type="password" required minlength="6" class="nb-input" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Role</label>
              <select v-model="roleForm" class="nb-input">
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4 border-t-3 border-[#111]">
              <button type="button" class="flex-1 nb-btn nb-btn-md nb-btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="flex-1 nb-btn nb-btn-md nb-btn-primary">Daftarkan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserProfile } from '@/types'

const authStore = useAuthStore()
const users = ref<UserProfile[]>([])
const showModal = ref(false)
const editingUser = ref<UserProfile | null>(null)
const nameForm = ref('')
const emailForm = ref('')
const passwordForm = ref('')
const roleForm = ref<'admin' | 'kasir'>('kasir')

function openModal() {
  editingUser.value = null
  nameForm.value = ''
  emailForm.value = ''
  passwordForm.value = ''
  roleForm.value = 'kasir'
  showModal.value = true
}

function openEditModal(user: UserProfile) {
  editingUser.value = user
  roleForm.value = user.role
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function loadUsers() {
  users.value = await authStore.getAllUsers()
}

async function handleRegister() {
  const ok = await authStore.register(emailForm.value, passwordForm.value, nameForm.value, roleForm.value)
  if (ok) {
    closeModal()
    await loadUsers()
  }
}

async function handleUpdateRole() {
  if (!editingUser.value) return
  const ok = await authStore.updateUserRole(editingUser.value.id, roleForm.value)
  if (ok) {
    closeModal()
    await loadUsers()
  }
}

function handleDelete(user: UserProfile) {
  if (user.id === authStore.profile?.id) return
  if (confirm(`Yakin ingin menghapus user "${user.name}"?`)) {
    authStore.deleteUser(user.id)
    loadUsers()
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(loadUsers)
</script>
