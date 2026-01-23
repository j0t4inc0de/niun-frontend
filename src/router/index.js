// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: () => import('../views/auth/SessionExpiredView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/dashboard/HomeView.vue'),
        },
        {
          path: 'cuentas',
          name: 'cuentas',
          component: () => import('../components/CuentasLista.vue'),
        },
        {
          path: 'boveda',
          name: 'boveda',
          component: () => import('../views/dashboard/BovedaView.vue'),
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('../views/dashboard/PerfilView.vue'),
        },
        // Ruta para testear componentes:  Sandbox
        {
          path: 'test',
          name: 'test-widget',
          component: () => import('../views/dashboard/PerfilView.vue'),
        },
      ],
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
