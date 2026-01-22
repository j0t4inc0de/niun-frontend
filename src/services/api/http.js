// src/services/api/http.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de Request (Añadir token)
http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const authStore = useAuthStore()

        const newToken = await authStore.renovarToken()

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return http(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.logout()

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default http
