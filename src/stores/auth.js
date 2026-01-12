// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth'

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
      console.error('Error en login:', error)
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
