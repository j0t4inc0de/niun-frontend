// src/services/cuentas.js
import http from './api/http'

export default {
  /**
   * Obtiene todas las cuentas del usuario.
   * Método: GET
   */
  obtenerTodas() {
    return http.get('/cuentas/')
  },

  crear(datosCuenta) {
    return http.post('/cuentas/', datosCuenta)
  },

  eliminar(id) {
    return http.delete(`/cuentas/${id}/`)
  },
  actualizar(id, datosCuenta) {
    return http.put(`/cuentas/${id}/`, datosCuenta)
  },
}
