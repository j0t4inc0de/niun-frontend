// src/services/anuncios.js
import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/anuncios/`

/**
 * Obtiene la lista de anuncios del backend.
 * @param {string} token
 * @returns {Promise<Array>}
 */
export const obtenerAnuncios = async (token) => {
  if (!token) throw new Error('Token no proporcionado')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }

  console.log(`📡 Servicio: Conectando a ${API_URL}`)
  const response = await axios.get(API_URL, config)

  if (Array.isArray(response.data)) {
    return response.data
  } else if (response.data && Array.isArray(response.data.results)) {
    return response.data.results
  } else {
    return []
  }
}
