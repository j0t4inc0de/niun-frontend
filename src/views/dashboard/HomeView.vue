<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

onMounted(() => {
    auth.fetchUserProfile();
});
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-8">

        <div>
            <h2 class="text-3xl font-bold text-white">Hola, {{ auth.user?.usuario?.username || 'Usuario' }} 👋</h2>
            <p class="text-mako-400 mt-1">Aquí tienes el resumen de tu seguridad.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div class="bg-mako-900 border border-mako-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl">verified</span>
                </div>
                <p class="text-mako-400 text-sm font-medium">Tu Plan</p>
                <h3 class="text-2xl font-bold text-white mt-1">{{ auth.user?.plan?.nombre || 'Cargando...' }}</h3>
                <div
                    class="mt-4 inline-flex px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                    {{ auth.user?.plan?.es_premium ? 'PREMIUM' : 'ACTIVO' }}
                </div>
            </div>

            <div class="bg-mako-900 border border-mako-800 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-end mb-2">
                    <p class="text-mako-400 text-sm font-medium">Cuentas Guardadas</p>
                    <span class="text-2xl font-bold text-white">
                        {{ auth.user?.limites?.cuentas?.usadas || 0 }}<span class="text-mako-500 text-lg">/{{
                            auth.user?.limites?.cuentas?.total || 10 }}</span>
                    </span>
                </div>
                <div class="w-full bg-mako-800 rounded-full h-2 mt-4">
                    <div class="bg-primary h-2 rounded-full transition-all duration-500"
                        :style="{ width: ((auth.user?.limites?.cuentas?.usadas / auth.user?.limites?.cuentas?.total) * 100) + '%' }">
                    </div>
                </div>
            </div>

            <div class="bg-mako-900 border border-mako-800 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-end mb-2">
                    <p class="text-mako-400 text-sm font-medium">Bóveda (Archivos)</p>
                    <span class="text-xl font-bold text-white">
                        {{ auth.user?.limites?.almacenamiento?.usado_mb || 0 }} MB
                    </span>
                </div>
                <p class="text-xs text-mako-500">De {{ auth.user?.limites?.almacenamiento?.total_gb || 0 }} GB
                    disponibles</p>
            </div>
        </div>

        <div
            class="bg-gradient-to-r from-primary/20 to-mako-800 border border-primary/30 rounded-2xl p-6 flex items-center justify-between">
            <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-yellow-400">emoji_events</span>
                    Recompensas
                </h3>
                <p class="text-mako-300 text-sm mt-1">Viste {{ auth.user?.gamificacion?.progreso_recompensa || 0 }} de
                    10 anuncios para tu próximo regalo.</p>
            </div>
            <button class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition">
                Ver Anuncio (+1)
            </button>
        </div>

    </div>
</template>