// src/services/auth.js
import http from './api/http'

export default {
  login(credentials) {
    return http.post('/auth/login/', credentials)
  },
  register(userData) {
    return http.post('/auth/register/', userData)
  },
  getProfile() {
    return http.get('/profile/me/')
  },
}
