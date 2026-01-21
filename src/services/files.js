// src/services/files.js
import axios from 'axios'
import http from './api/http'

const API_URL = import.meta.env.VITE_API_BASE_URL

export default {
  listar() {
    return http.get('/files/')
  },

  subir(formData) {
    const token = localStorage.getItem('access_token')

    return axios.post(`${API_URL}/files/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  descargar(id) {
    return http.get(`/files/${id}/download/`, {
      responseType: 'blob',
    })
  },

  eliminar(id) {
    return http.delete(`/files/${id}/`)
  },
}
