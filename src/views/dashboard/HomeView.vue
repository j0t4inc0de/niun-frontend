<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AnunciosWidget from '@/components/ui/AnunciosWidget.vue';

const auth = useAuthStore();

onMounted(() => {
    auth.fetchUserProfile();
});
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-6 md:space-y-12 pb-12">

        <div class="relative pt-4">
            <div
                class="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none">
            </div>

            <div class="relative z-10">
                <h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-lg">
                    Hola,
                    <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-mako-400 to-gray-800 dark:from-white dark:to-mako-400">
                        {{ auth.user?.usuario?.username || 'Usuario' }}
                    </span>
                </h2>

                <p class="text-gray-500 dark:text-mako-300 mt-1 md:mt-2 text-sm md:text-lg font-light tracking-wide">
                    Panel de Control

                    <span class="mx-2 text-gray-300 dark:text-mako-600">|</span>

                    Resumen
                </p>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">

            <!-- Tarejta de Plan -->
            <div
                class="col-span-2 md:col-span-1 group relative overflow-hidden rounded-[2rem] border border-black/20 dark:border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-primary/50 dark:hover:border-white/10 dark:hover:shadow-primary/10">
                <div
                    class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent">
                </div>

                <div
                    class="p-6 md:p-8 h-full flex flex-row md:flex-col justify-between items-center md:items-start relative z-10 gap-4">
                    <div>
                        <p
                            class="text-[0.65rem] md:text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mb-1 md:mb-2">
                            Tu Plan</p>
                        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{
                            auth.user?.plan?.nombre
                            || '...' }}</h3>
                    </div>
                    <div class="md:mt-8">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gray-50 dark:bg-black/20 border border-black/20 dark:border-white/5 backdrop-blur-md">
                            <span class="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span
                                    class="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-green-500"></span>
                            </span>
                            <span
                                class="text-[0.65rem] md:text-xs font-bold text-gray-900 dark:text-white tracking-wide">
                                {{ auth.user?.plan?.es_premium ? 'PREMIUM' : 'ESTÁNDAR' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Tarjeta de Cuentas -->
            <div
                class="col-span-1 group relative overflow-hidden rounded-[2rem] border border-black/20 dark:border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-primary/50 dark:hover:border-white/10 dark:hover:shadow-primary/10">
                <div class=" absolute -right-10 -top-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl
                pointer-events-none group-hover:bg-blue-600/30 transition-colors duration-500">
                </div>

                <div class="p-5 md:p-8 h-full flex flex-col justify-between relative z-10">
                    <div class="flex justify-between items-start">
                        <p class="text-[0.60rem] md:text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mt-1">
                            Cuentas</p>
                    </div>

                    <div class="mt-2 md:mt-4 flex flex-col md:flex-row md:items-baseline gap-0 md:gap-1.5">
                        <span
                            class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter drop-shadow-lg">
                            {{ auth.user?.limites?.cuentas?.usadas || 0 }}
                        </span>
                        <div class="flex flex-col">
                            <span
                                class="text-xs md:text-lg font-bold text-gray-900 dark:text-mako-300 hidden md:block">Items</span>
                            <span
                                class="text-[0.6rem] font-bold text-mako-500 uppercase tracking-wide -mt-1 md:block hidden">Activos</span>
                        </div>
                    </div>

                    <div class="mt-4 md:mt-8 space-y-2 md:space-y-3">
                        <div
                            class="relative w-full h-3 md:h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                            <div class="absolute top-0 left-0 h-full rounded-full 
                bg-gradient-to-r from-primary to-sky-400 dark:from-indigo-500 dark:via-blue-500 dark:to-sky-400 
                shadow-none dark:shadow-[0_0_15px_rgba(59,130,246,0.6)] 
                transition-all duration-1000 ease-out"
                                :style="{ width: ((auth.user?.limites?.cuentas?.usadas / auth.user?.limites?.cuentas?.total) * 100) + '%' }">

                                <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-80">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center text-[0.65rem] md:text-xs font-medium px-1">
                            <div class="flex items-center gap-1.5 text-gray-900 dark:text-mako-300">
                                <span>Max: <span class="text-gray-900 dark:text-white font-bold">{{
                                    auth.user?.limites?.cuentas?.total ||
                                        10 }}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tarjeta de Boveda -->
            <div
                class="col-span-1 group relative overflow-hidden rounded-[2rem] border border-black/20 dark:border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-primary/50 dark:hover:border-white/10 dark:hover:shadow-primary/10">
                <div class=" absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none
            group-hover:bg-primary/30 transition-colors duration-500">
                </div>

                <div class="p-5 md:p-8 h-full flex flex-col justify-between relative z-10">
                    <div class="flex justify-between items-start">
                        <p class="text-[0.60rem] md:text-xs font-bold text-mako-400 uppercase tracking-[0.2em] mt-1">
                            Espacio</p>
                    </div>

                    <div class="mt-2 md:mt-4 flex flex-col md:flex-row md:items-baseline gap-0 md:gap-1.5">
                        <span
                            class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter drop-shadow-lg">
                            {{ auth.user?.limites?.almacenamiento?.usado_mb || 0 }}
                        </span>
                        <div class="flex flex-col">
                            <span class="text-[0.7rem] md:text-lg font-bold text-gray-900 dark:text-mako-300">MB</span>
                        </div>
                    </div>

                    <div class="mt-4 md:mt-8 space-y-2 md:space-y-3">
                        <div
                            class="relative w-full h-3 md:h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                            <div class="absolute top-0 left-0 h-full rounded-full 
                bg-gradient-to-r from-primary to-sky-400 dark:from-indigo-500 dark:via-blue-500 dark:to-sky-400 
                shadow-none dark:shadow-[0_0_15px_rgba(59,130,246,0.6)] 
                transition-all duration-1000 ease-out"
                                :style="{ width: ((auth.user?.limites?.cuentas?.usadas / auth.user?.limites?.cuentas?.total) * 100) + '%' }">

                                <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-80">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center text-[0.65rem] md:text-xs font-medium px-1">
                            <div class="flex items-center gap-1.5 text-gray-900 dark:text-white">
                                <span>De: <span class="text-gray-900 dark:text-white font-bold">{{
                                    auth.user?.limites?.almacenamiento?.total_gb || 0 }} GB</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Seccion Recompensas -->
        <div
            class="relative overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-r from-primary/30 via-gray-200 to-gray-300 dark:from-primary/30 dark:via-mako-800 dark:to-mako-900 shadow-2xl shadow-primary/10">

            <div
                class="relative bg-white/80 dark:bg-mako-950/80 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 overflow-hidden">

                <div
                    class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3">
                </div>
                <div
                    class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none translate-y-1/3 -translate-x-1/3">
                </div>

                <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div class="flex items-center gap-4 md:gap-6 text-center md:text-left">

                        <div
                            class="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 dark:border-yellow-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                            <span
                                class="material-symbols-outlined text-3xl md:text-4xl text-yellow-600 dark:text-yellow-400 drop-shadow-lg">emoji_events</span>
                        </div>

                        <div>
                            <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                                Recompensas Niun</h3>
                            <p class="text-gray-600 dark:text-mako-300 max-w-lg leading-relaxed text-sm md:text-lg">
                                Llevas <span class="text-gray-900 dark:text-white font-bold text-lg md:text-xl">{{
                                    auth.user?.gamificacion?.progreso_recompensa || 0 }}/10</span> anuncios.
                                <br class="hidden md:block" />¡Estás muy cerca de tu próximo premio! 🎁
                            </p>
                        </div>
                    </div>

                    <button
                        class="w-full md:w-auto group relative px-6 py-3 md:px-8 md:py-4 bg-primary rounded-2xl text-white font-bold text-base md:text-lg shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_40px_rgba(19,91,236,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]">
                        </div>
                        <div class="relative flex items-center justify-center gap-2 md:gap-3">
                            <span>VER ANUNCIO</span>
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