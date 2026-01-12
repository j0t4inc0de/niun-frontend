<!-- src\views\dashboard\HomeView.vue -->
<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AnunciosWidget from '@/components/AnunciosWidget.vue';

const auth = useAuthStore();

onMounted(() => {
    auth.fetchUserProfile();
});
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-12 pb-12">

        <div class="relative">
            <div
                class="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none">
            </div>

            <div class="relative z-10">
                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                    Hola, <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-mako-400">{{
                        auth.user?.usuario?.username || 'Usuario' }}</span>
                </h2>
                <p class="text-mako-300 mt-2 text-lg font-light tracking-wide">
                    Panel de Control <span class="mx-2 text-mako-600">|</span> Resumen de Seguridad
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div
                class="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-primary/10">
                <div
                    class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent">
                </div>

                <div class="p-8 h-full flex flex-col justify-between relative z-10">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mb-2">Tu Plan</p>
                            <h3 class="text-3xl font-bold text-white tracking-tight">{{ auth.user?.plan?.nombre ||
                                '...' }}</h3>
                        </div>
                    </div>

                    <div class="mt-8">
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/5 backdrop-blur-md">
                            <span class="relative flex h-2.5 w-2.5">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span class="text-xs font-bold text-white tracking-wide">
                                {{ auth.user?.plan?.es_premium ? 'PREMIUM ACTIVADO' : 'CUENTA ESTÁNDAR' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-primary/20">

                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/30 transition-colors duration-500">
                </div>

                <div class="p-8 h-full flex flex-col justify-between relative z-10">
                    <div class="flex justify-between items-start">
                        <p class="text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mt-1">Cuentas Guardadas</p>
                    </div>

                    <div class="mt-4 flex items-baseline gap-1.5">
                        <span class="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                            {{ auth.user?.limites?.cuentas?.usadas || 0 }}
                        </span>
                        <div class="flex flex-col">
                            <span class="text-lg font-bold text-mako-300">Items</span>
                            <span
                                class="text-[0.6rem] font-bold text-mako-500 uppercase tracking-wide -mt-1">Activos</span>
                        </div>
                    </div>

                    <div class="mt-8 space-y-3">
                        <div
                            class="relative w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">

                            <div class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out"
                                :style="{ width: ((auth.user?.limites?.cuentas?.usadas / auth.user?.limites?.cuentas?.total) * 100) + '%' }">
                                <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-80">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center text-xs font-medium px-1">
                            <span class="text-mako-400">0</span>
                            <div class="flex items-center gap-1.5 text-mako-300">
                                <span>Límite: <span class="text-white font-bold">{{ auth.user?.limites?.cuentas?.total
                                    || 10 }}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-primary/20">

                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-colors duration-500">
                </div>

                <div class="p-8 h-full flex flex-col justify-between relative z-10">
                    <div class="flex justify-between items-start">
                        <p class="text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mt-1">Almacenamiento</p>
                    </div>

                    <div class="mt-4 flex items-baseline gap-1.5">
                        <span class="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                            {{ auth.user?.limites?.almacenamiento?.usado_mb || 0 }}
                        </span>
                        <div class="flex flex-col">
                            <span class="text-lg font-bold text-mako-300">MB</span>
                            <span
                                class="text-[0.6rem] font-bold text-mako-500 uppercase tracking-wide -mt-1">Usados</span>
                        </div>
                    </div>

                    <div class="mt-8 space-y-3">
                        <div
                            class="relative w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">

                            <div class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-primary to-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.6)] transition-all duration-1000 ease-out"
                                :style="{ width: (auth.user?.limites?.almacenamiento?.porcentaje || 0) + '%' }">
                                <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-80">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center text-xs font-medium px-1">
                            <span class="text-mako-400">0 MB</span>
                            <div class="flex items-center gap-1.5 text-mako-300">
                                <span>Total: <span class="text-white font-bold">{{
                                    auth.user?.limites?.almacenamiento?.total_gb || 0 }} GB</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="relative overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-r from-primary/30 via-mako-800 to-mako-900 shadow-2xl shadow-primary/10">
            <div class="relative bg-mako-950/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 overflow-hidden">

                <div
                    class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3">
                </div>
                <div
                    class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none translate-y-1/3 -translate-x-1/3">
                </div>

                <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                    <div class="flex items-center gap-6 text-center md:text-left">
                        <div
                            class="shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                            <span
                                class="material-symbols-outlined text-4xl text-yellow-400 drop-shadow-lg">emoji_events</span>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white mb-2">Recompensas Niun</h3>
                            <p class="text-mako-300 max-w-lg leading-relaxed text-lg">
                                Llevas <span class="text-white font-bold text-xl">{{
                                    auth.user?.gamificacion?.progreso_recompensa || 0 }}/10</span> anuncios.
                                <br class="hidden md:block" />¡Estás muy cerca de tu próximo premio! 🎁
                            </p>
                        </div>
                    </div>

                    <button
                        class="group relative px-8 py-4 bg-primary rounded-2xl text-white font-bold text-lg shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_40px_rgba(19,91,236,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full md:w-auto">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]">
                        </div>
                        <div class="relative flex items-center justify-center gap-3">
                            <span>VER ANUNCIO (+1)</span>
                            <span
                                class="material-symbols-outlined group-hover:rotate-12 transition-transform">play_circle</span>
                        </div>
                    </button>

                </div>
            </div>
        </div>

        <AnunciosWidget />

    </div>
</template>

<style scoped>
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>