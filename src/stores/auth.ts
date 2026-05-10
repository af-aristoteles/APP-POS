import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isKasir = computed(() => profile.value?.role === 'kasir')
  const isLoggedIn = computed(() => !!user.value && !!profile.value)

  async function init() {
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        user.value = data.session.user
        await fetchProfile()
        // If profile doesn't exist after fetch, try to create it
        if (!profile.value) {
          await tryCreateProfile()
        }
      }
    } catch {
      // Ignore errors during init, user will need to login again
    }
    loading.value = false
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data, error: err } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle()
    if (data) {
      profile.value = data as UserProfile
    } else {
      profile.value = null
    }
  }

  async function fetchProfileForUser(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (data) {
      profile.value = data as UserProfile
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      if (err.message?.includes('Email not confirmed') || err.message?.includes('not confirmed')) {
        error.value = 'Email belum diverifikasi. Cek inbox email Anda.'
      } else if (err.message?.includes('Invalid login credentials')) {
        error.value = 'Email atau password salah'
      } else {
        error.value = err.message || 'Login gagal'
      }
      loading.value = false
      return false
    }

    user.value = data.user
    await fetchProfile()

    if (!profile.value) {
      // Retry profile creation a few times
      for (let i = 0; i < 3; i++) {
        await tryCreateProfile()
        if (profile.value) break
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    loading.value = false
    return profile.value !== null
  }

  async function tryCreateProfile() {
    if (!user.value) return
    const defaultName = user.value.email?.split('@')[0] || 'User'
    try {
      const { error: insertErr } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.value.id,
          email: user.value.email,
          name: defaultName,
          role: 'kasir',
        }, { onConflict: 'id' })

      if (!insertErr) {
        await fetchProfile()
      }
    } catch {
      // Ignore errors
    }
  }

  async function register(email: string, password: string, name: string, role: 'admin' | 'kasir') {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (err) {
      error.value = err.message.includes('already registered') || err.message.includes('User already registered')
        ? 'Email sudah terdaftar'
        : err.message
      loading.value = false
      return false
    }

    if (data.user) {
      await new Promise((r) => setTimeout(r, 1000))
      await fetchProfileForUser(data.user.id)

      if (!profile.value) {
        const { error: insertErr } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name,
            role,
          })

        if (insertErr) {
          console.error('Profile insert failed:', insertErr.message)
          error.value = `User dibuat tapi profile gagal: ${insertErr.message}`
        } else {
          await fetchProfileForUser(data.user.id)
        }
      }
    }

    loading.value = false
    return true
  }

  async function logout() {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // Ignore errors from signOut
    }
    user.value = null
    profile.value = null
    error.value = null
    // Clear all Supabase localStorage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    })
  }

  async function forgotPassword(email: string) {
    loading.value = true
    error.value = null

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }

    loading.value = false
    return true
  }

  async function updateProfileData(name: string, email: string) {
    loading.value = true
    error.value = null

    if (!user.value) { loading.value = false; return false }

    const { error: err } = await supabase
      .from('user_profiles')
      .update({ name, email })
      .eq('id', user.value.id)

    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }

    if (profile.value) {
      profile.value.name = name
      profile.value.email = email
    }

    loading.value = false
    return true
  }

  async function updatePassword(newPassword: string) {
    loading.value = true
    error.value = null

    const { error: err } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }

    loading.value = false
    return true
  }

  async function getAllUsers() {
    const { data, error: err } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) return []
    return data as UserProfile[]
  }

  async function updateUserRole(userId: string, role: 'admin' | 'kasir') {
    const { error: err } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
    return !err
  }

  async function deleteUser(userId: string) {
    const { error: err } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    return !err
  }

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    isKasir,
    isLoggedIn,
    init,
    fetchProfile,
    login,
    register,
    logout,
    forgotPassword,
    updateProfileData,
    updatePassword,
    getAllUsers,
    updateUserRole,
    deleteUser,
  }
})
