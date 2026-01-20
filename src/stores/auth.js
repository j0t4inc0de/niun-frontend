// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Acciones
  async function login(credentials) {
    try {
      // credentials incluye { email, password, security_answer }
      const response = await authService.login(credentials)

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      token.value = accessToken

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)

      await fetchUserProfile()

      return true
    } catch (error) {
      handleAuthError(error) // Manejo centralizado de errores críticos
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
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Redirigir al login
    router.push('/login')
  }

  // Función auxiliar para manejar el "Game Over" y errores de seguridad
  function handleAuthError(error) {
    if (error.response && error.response.data) {
      const detail = error.response.data.detail || ''

      // CASO CRÍTICO: CUENTA ELIMINADA
      // Detectamos el mensaje específico que manda tu backend cuando borra al usuario
      if (typeof detail === 'string' && detail.includes('eliminados permanentemente')) {
        // Limpiamos todo rastro local
        user.value = null
        token.value = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

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
