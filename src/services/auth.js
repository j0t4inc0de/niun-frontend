// src/services/auth.js
import http from './api/http'

export default {
  login(email, password) {
    return http.post('/auth/login/', { email, password })
  },
  register(userData) {
    return http.post('/auth/register/', userData)
  },
  getProfile() {
    return http.get('/profile/me/')
  },
}
