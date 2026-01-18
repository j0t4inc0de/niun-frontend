// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      token.value = accessToken
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)

      await fetchUserProfile()
      return true
    } catch (error) {
      handleAuthError(error)
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  function handleAuthError(error) {
    if (error.response && error.response.data) {
      const detail = error.response.data.detail || ''

      // CASO: CUENTA ELIMINADA
      if (typeof detail === 'string' && detail.includes('eliminados permanentemente')) {
        logout()
        alert(
          'Niun:\n\nTu cuenta ha sido eliminada por seguridad debido a múltiples intentos fallidos.',
        )
        window.location.reload()
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
