<!-- src/components/AnunciosWidget.vue -->
<template>
    <div
        class="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300">

        <div
            class="absolute -left-10 -top-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-500">
        </div>

        <div class="relative z-10 p-8 md:p-10">

            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                        <span class="material-symbols-outlined text-white">campaign</span>
                    </div>
                    <h3 class="text-xl font-bold text-white tracking-tight">Novedades y Anuncios</h3>
                </div>

                <div v-if="!cargando && anuncios.length > 1" class="flex items-center gap-2">
                    <button @click="prevSlide"
                        class="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                    </button>
                    <span class="text-xs font-mono text-white/50 min-w-[30px] text-center">
                        {{ indiceActual + 1 }}/{{ anuncios.length }}
                    </span>
                    <button @click="nextSlide"
                        class="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_forward_ios</span>
                    </button>
                </div>
            </div>

            <div v-if="cargando" class="py-10 text-center animate-pulse">
                <div class="h-4 bg-white/10 rounded w-3/4 mx-auto mb-3"></div>
                <div class="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
                <p class="text-xs text-white/40 mt-4">Conectando con el servidor...</p>
            </div>

            <div v-else-if="error" class="py-6 text-center border border-red-500/30 rounded-2xl bg-red-500/10">
                <span class="material-symbols-outlined text-red-400 text-3xl mb-2">error</span>
                <p class="text-red-200 font-bold">Error de conexión</p>
                <p class="text-xs text-red-300/70 mt-1 px-4">No se pudo conectar con /api/anuncios/. Revisa la consola
                    (F12).</p>
            </div>

            <div v-else-if="anuncios.length === 0"
                class="py-6 text-center border border-white/10 rounded-2xl bg-white/5">
                <span class="material-symbols-outlined text-white/30 text-3xl mb-2">inbox</span>
                <p class="text-white/60 font-medium">No hay anuncios activos</p>
                <p class="text-xs text-white/30 mt-1">Todo está tranquilo por aquí.</p>
            </div>

            <div v-else class="relative min-h-[120px]">
                <Transition name="fade" mode="out-in">

                    <div :key="anuncioActual.id" :class="[
                        'relative overflow-hidden rounded-2xl p-6 border transition-all',
                        estilosPorTipo[anuncioActual.tipo] || estilosPorTipo['info']
                    ]">

                        <div
                            class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50 pointer-events-none">
                        </div>

                        <div class="relative z-10 flex gap-5">
                            <div class="shrink-0 mt-1">
                                <span v-if="anuncioActual.tipo === 'alerta'"
                                    class="text-red-400 material-symbols-outlined text-3xl">warning</span>
                                <span v-else-if="anuncioActual.tipo === 'promo'"
                                    class="text-purple-400 material-symbols-outlined text-3xl">verified</span>
                                <span v-else class="text-blue-400 material-symbols-outlined text-3xl">info</span>
                            </div>

                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-bold text-white text-lg tracking-wide">{{ anuncioActual.titulo }}
                                    </h4>
                                    <span
                                        class="text-[0.65rem] font-bold uppercase tracking-wider opacity-60 py-1 px-3 rounded-full bg-black/30 border border-white/10">
                                        {{ formatearFecha(anuncioActual.creado_en) }}
                                    </span>
                                </div>

                                <p class="text-sm text-gray-200 leading-relaxed font-light whitespace-pre-line">
                                    {{ anuncioActual.mensaje }}
                                </p>
                            </div>
                        </div>
                    </div>

                </Transition>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Estado del componente
const cargando = ref(true);
const error = ref(false);
const indiceActual = ref(0);
const anuncios = ref([]);

// Estilos dinámicos para el borde/color según el tipo de anuncio
const estilosPorTipo = {
    info: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
    alerta: 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20',
    promo: 'border-purple-500/30 bg-purple-500/10 hover:purple-blue-500/20'
};

// Computada para obtener el anuncio visible
const anuncioActual = computed(() => {
    if (anuncios.value.length === 0) return null;
    return anuncios.value[indiceActual.value];
});

// Formatear fecha simple
const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(fecha);
};

// Navegación del slider
const nextSlide = () => {
    if (indiceActual.value < anuncios.value.length - 1) {
        indiceActual.value++;
    } else {
        indiceActual.value = 0; // Loop al inicio
    }
};

const prevSlide = () => {
    if (indiceActual.value > 0) {
        indiceActual.value--;
    } else {
        indiceActual.value = anuncios.value.length - 1; // Loop al final
    }
};

// Simular carga de datos (Mock Data)
onMounted(() => {
    setTimeout(() => {
        // Aquí conectarías con tu API real luego
        anuncios.value = [
            {
                id: 1,
                titulo: 'Mantenimiento Programado',
                mensaje: 'La plataforma estará en mantenimiento el domingo de 3:00 AM a 5:00 AM.',
                tipo: 'alerta',
                creado_en: '2023-10-25T10:00:00'
            },
            {
                id: 2,
                titulo: 'Nueva Funcionalidad: Bóveda',
                mensaje: 'Ahora puedes guardar archivos encriptados en tu bóveda personal.',
                tipo: 'promo',
                creado_en: '2023-10-24T15:30:00'
            },
            {
                id: 3,
                titulo: 'Bienvenido a Niun',
                mensaje: 'Gracias por unirte. Explora el dashboard para ver tus estadísticas.',
                tipo: 'info',
                creado_en: '2023-10-20T09:00:00'
            }
        ];
        cargando.value = false;
    }, 1500); // Retraso artificial para ver el estado de carga
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>