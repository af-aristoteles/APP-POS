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

// Init auth — wait for session restore to complete before mounting app
await authStore.init()

supabase.auth.onAuthStateChange(async (event, session) => {
  if (
    event === 'SIGNED_IN' ||
    event === 'INITIAL_SESSION' ||
    event === 'TOKEN_REFRESHED'
  ) {
    if (session) {
      authStore.user = session.user
      await authStore.fetchProfile()
    }
  }
  if (event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') {
    if (event === 'PASSWORD_RECOVERY' && session) {
      authStore.user = session.user
      await authStore.fetchProfile()
    }
    if (event === 'SIGNED_OUT') {
      authStore.user = null
      authStore.profile = null
    }
  }
})

app.mount('#app')
