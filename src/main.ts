import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()

// Init auth with timeout to avoid blocking
const initPromise = authStore.init()
const timeout = new Promise((resolve) => setTimeout(resolve, 5000))
await Promise.race([initPromise, timeout])

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    authStore.user = session.user
    await authStore.fetchProfile()
  }
  if (event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') {
    if (event === 'PASSWORD_RECOVERY' && session) {
      authStore.user = session.user
      await authStore.fetchProfile()
    }
    if (event === 'SIGNED_OUT') {
      authStore.user = null
      authStore.profile = null
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key)
      })
    }
  }
})

app.mount('#app')
