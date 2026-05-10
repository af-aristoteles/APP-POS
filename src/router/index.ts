import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { public: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'pos',
          name: 'pos',
          component: () => import('@/views/POSView.vue'),
          meta: { role: 'admin', roleAlt: 'kasir' },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductsView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/CategoriesView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/views/TransactionsView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/ReportsView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'alerts',
          name: 'alerts',
          component: () => import('@/views/AlertsView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { role: 'admin', roleAlt: 'kasir' },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: { role: 'admin' },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public && authStore.isLoggedIn) {
    if (authStore.isAdmin) return next('/')
    return next('/pos')
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  if (to.path === '/' && authStore.isKasir) {
    return next('/pos')
  }

  const pageRole = to.meta.role as string | undefined
  const pageRoleAlt = to.meta.roleAlt as string | undefined
  const userRole = authStore.profile?.role || ''

  if (pageRole && pageRole !== userRole && pageRoleAlt !== userRole) {
    return next(userRole === 'kasir' ? '/pos' : '/')
  }

  next()
})

export default router
