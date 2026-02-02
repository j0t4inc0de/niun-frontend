<!-- src/components/ui/AnunciosWidget.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

import { obtenerAnuncios } from '@/services/anuncios';

// Estados
const anuncios = ref([]);
const cargando = ref(true);
const error = ref(false);
const errorMsg = ref('');
const indiceActual = ref(0);
const auth = useAuthStore();

// Estilos
const estilosPorTipo = {
    info: 'bg-blue-500/10  border-blue-500/20  shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    promo: 'bg-purple-500/10 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    alerta: 'bg-red-500/10    border-red-500/20    shadow-[0_0_20px_rgba(239,68,68,0.1)]'
};

const anuncioActual = computed(() => anuncios.value[indiceActual.value] || {});

const fetchAnuncios = async () => {
    cargando.value = true;
    error.value = false;

    try {
        const token = auth.token || auth.accessToken;

        const datos = await obtenerAnuncios(token);

        anuncios.value = datos;

    } catch (err) {
        error.value = true;

        if (err.response && err.response.status === 401) {
            errorMsg.value = "Sesión expirada.";
        } else {
            errorMsg.value = err.message || "Error de conexión";
        }
    } finally {
        cargando.value = false;
    }
};

const nextSlide = () => {
    if (anuncios.value.length === 0) return;
    indiceActual.value = (indiceActual.value + 1) % anuncios.value.length;
};

const prevSlide = () => {
    if (anuncios.value.length === 0) return;
    indiceActual.value = (indiceActual.value - 1 + anuncios.value.length) % anuncios.value.length;
};

const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long' }).format(fecha);
};

onMounted(() => {
    fetchAnuncios();
});
</script>

<template>
    <div
        class="group relative overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white dark:border-white/10 dark:bg-gradient-to-br dark:from-white/5 dark:via-white/[0.02] dark:to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300">

        <div
            class="absolute -left-10 -top-10 w-64 h-64 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/10 dark:group-hover:bg-blue-600/20 transition-colors duration-500">
        </div>

        <div class="relative z-10 p-8 md:p-10">

            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div
                        class="p-3 rounded-xl bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10 shadow-inner">
                        <span class="material-symbols-outlined text-gray-600 dark:text-white">campaign</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Novedades y Anuncios</h3>
                </div>

                <div v-if="!cargando && anuncios.length > 1" class="flex items-center gap-2">
                    <button @click="prevSlide"
                        class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 dark:hover:bg-white/10 dark:text-white/70 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                    </button>

                    <span class="text-xs font-mono text-gray-400 dark:text-white/50 min-w-[30px] text-center">
                        {{ indiceActual + 1 }}/{{ anuncios.length }}
                    </span>

                    <button @click="nextSlide"
                        class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 dark:hover:bg-white/10 dark:text-white/70 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_forward_ios</span>
                    </button>
                </div>
            </div>

            <div v-if="cargando" class="py-10 text-center animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mx-auto mb-3"></div>
                <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mx-auto"></div>
                <p class="text-xs text-gray-400 dark:text-white/40 mt-4">Conectando con el servidor...</p>
            </div>

            <div v-else-if="error"
                class="py-6 text-center border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 rounded-2xl">
                <span class="material-symbols-outlined text-red-500 dark:text-red-400 text-3xl mb-2">error</span>
                <p class="text-red-600 dark:text-red-200 font-bold">Error de conexión</p>
                <p class="text-xs text-red-500 dark:text-red-300/70 mt-1 px-4">{{ errorMsg }}</p>
            </div>

            <div v-else-if="anuncios.length === 0"
                class="py-6 text-center border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 rounded-2xl">
                <span class="material-symbols-outlined text-gray-300 dark:text-white/30 text-3xl mb-2">inbox</span>
                <p class="text-gray-500 dark:text-white/60 font-medium">No hay anuncios activos</p>
                <p class="text-xs text-gray-400 dark:text-white/30 mt-1">El servidor respondió OK, pero la lista está
                    vacía.</p>
            </div>

            <div v-else class="relative min-h-[120px]">
                <Transition name="fade" mode="out-in">

                    <div :key="anuncioActual.id" :class="[
                        'relative overflow-hidden rounded-2xl p-6 border transition-all',
                        estilosPorTipo[anuncioActual.tipo] || estilosPorTipo['info']
                    ]">

                        <div
                            class="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-50 pointer-events-none dark:from-white/5">
                        </div>

                        <div class="relative z-10 flex gap-5">
                            <div class="shrink-0 mt-1">
                                <span v-if="anuncioActual.tipo === 'alerta'"
                                    class="text-red-500 dark:text-red-400 material-symbols-outlined text-3xl">warning</span>
                                <span v-else-if="anuncioActual.tipo === 'promo'"
                                    class="text-purple-500 dark:text-purple-400 material-symbols-outlined text-3xl">verified</span>
                                <span v-else
                                    class="text-blue-500 dark:text-blue-400 material-symbols-outlined text-3xl">info</span>
                            </div>

                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-bold text-gray-900 dark:text-white text-lg tracking-wide">{{
                                        anuncioActual.titulo }}
                                    </h4>

                                    <span class="text-[0.65rem] font-bold uppercase tracking-wider opacity-80 dark:opacity-60 py-1 px-3 rounded-full 
                                               bg-white/60 border border-gray-200 text-gray-700
                                               dark:bg-black/30 dark:border-white/10 dark:text-white">
                                        {{ formatearFecha(anuncioActual.creado_en) }}
                                    </span>
                                </div>

                                <p
                                    class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-light whitespace-pre-line">
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