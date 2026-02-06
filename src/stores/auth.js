// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth'
import router from '../router'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(sessionStorage.getItem('access_token'))
  const refreshToken = ref(sessionStorage.getItem('refresh_token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)

      const accessToken = response.data.access
      const refreshTokenData = response.data.refresh

      token.value = accessToken
      refreshToken.value = refreshTokenData

      sessionStorage.setItem('access_token', accessToken)
      sessionStorage.setItem('refresh_token', refreshTokenData)

      await fetchUserProfile()
      return true
    } catch (error) {
      handleAuthError(error)
      throw error
    }
  }

  async function renovarToken() {
    try {
      const currentRefreshToken = sessionStorage.getItem('refresh_token')
      if (!currentRefreshToken) throw new Error('No hay refresh token disponible')

      let baseURL = import.meta.env.VITE_API_BASE_URL
      if (baseURL.endsWith('/')) {
        baseURL = baseURL.slice(0, -1)
      }

      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: currentRefreshToken,
      })

      const newAccessToken = response.data.access

      token.value = newAccessToken
      sessionStorage.setItem('access_token', newAccessToken)

      if (response.data.refresh) {
        refreshToken.value = response.data.refresh
        sessionStorage.setItem('refresh_token', response.data.refresh)
      }

      return newAccessToken
    } catch (error) {
      console.error('Falló la renovación de token:', error)
      logout(false)
      throw error
    }
  }

  // 3. Perfil de Usuario
  async function fetchUserProfile() {
    if (!token.value) return
    try {
      const response = await authService.getProfile()
      user.value = response.data
    } catch (error) {
      // Si falla cargar el perfil (y no es por token, ya que el interceptor lo habría manejado),
      // podría ser un error de red o servidor. No deslogueamos agresivamente aquí a menos que sea necesario.
      console.error('Error cargando perfil:', error)
    }
  }

  // 4. Logout
  function logout(redirect = true) {
    user.value = null
    token.value = null
    refreshToken.value = null

    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')

    if (redirect) {
      router.push('/login')
    }
  }

  // Manejo de errores específicos (ej. autodestrucción de cuenta)
  function handleAuthError(error) {
    if (error.response && error.response.data) {
      const detail = error.response.data.detail || ''

      if (typeof detail === 'string' && detail.includes('eliminados permanentemente')) {
        logout()
        alert('Tu cuenta ha sido eliminada permanentemente por seguridad.')
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
    renovarToken,
  }
})
