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
      path: '/dashboard',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/dashboard/HomeView.vue'),
        },
        // Ruta para testear componentes:  Sandbox
        {
          path: 'test',
          name: 'test-widget',
          component: () => import('../components/ui/AnunciosWidget.vue'),
        },
      ],
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
  ],
})

// Guardia de Navegación (Igual que antes)
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
