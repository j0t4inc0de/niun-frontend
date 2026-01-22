// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(sessionStorage.getItem('access_token'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Acciones
  async function login(credentials) {
    try {
      const response = await authService.login(credentials)

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      token.value = accessToken

      sessionStorage.setItem('access_token', accessToken)
      sessionStorage.setItem('refresh_token', refreshToken)

      await fetchUserProfile()

      return true
    } catch (error) {
      handleAuthError(error)
      throw error
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return
    try {
      const response = await authService.getProfile()
      user.value = response.data
    } catch (error) {
      console.error('Error cargando perfil:', error)
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null

    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')

    router.push('/login')
  }

  function handleAuthError(error) {
    if (error.response && error.response.data) {
      const detail = error.response.data.detail || ''

      if (typeof detail === 'string' && detail.includes('eliminados permanentemente')) {
        user.value = null
        token.value = null

        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')

        alert(
          'Tu cuenta ha sido eliminada permanentemente por seguridad debido a múltiples intentos fallidos.',
        )

        window.location.href = '/login'
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchUserProfile,
  }
})
