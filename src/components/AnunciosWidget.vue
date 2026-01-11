<!-- src\components\AnunciosWidget.vue -->
<template>
    <div v-if="anuncios.length > 0" class="mb-6 space-y-4">
        <div v-for="anuncio in anuncios" :key="anuncio.id" :class="[
            'p-4 rounded-lg border-l-4 shadow-sm flex items-start justify-between',
            clasesPorTipo[anuncio.tipo] || clasesPorTipo['info']
        ]">
            <div>
                <h3 class="font-bold text-sm uppercase mb-1 flex items-center gap-2">
                    <span v-if="anuncio.tipo === 'alerta'">⚠️</span>
                    <span v-else-if="anuncio.tipo === 'promo'">🎁</span>
                    <span v-else>ℹ️</span>
                    {{ anuncio.titulo }}
                </h3>
                <p class="text-sm whitespace-pre-line">{{ anuncio.mensaje }}</p>
                <span class="text-xs opacity-75 mt-2 block">
                    Publicado el: {{ formatearFecha(anuncio.creado_en) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // O tu instancia configurada de axios

const anuncios = ref([]);

// Configuración de estilos Tailwind según el tipo de anuncio
const clasesPorTipo = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    promo: 'bg-purple-50 border-purple-500 text-purple-900',
    alerta: 'bg-red-50 border-red-500 text-red-900'
};

const fetchAnuncios = async () => {
    try {
        // Ajusta la URL según tu rutas de Django
        const response = await axios.get('/api/cuentas/anuncios/');
        anuncios.value = response.data;
    } catch (error) {
        console.error('Error cargando anuncios:', error);
    }
};

const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(fecha);
};

onMounted(() => {
    fetchAnuncios();
});
</script>