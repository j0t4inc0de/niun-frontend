// src/services/files.js
import http from './api/http'

export default {
  listar() {
    return http.get('/files/')
  },

  subir(formData) {
    return http.post('/files/', formData, {
      headers: {
        'Content-Type': undefined,
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
