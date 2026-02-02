<!-- src/layouts/MainLayout.vue -->
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Variable para controlar el menú en celular
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};

</script>

<template>
    <div
        class="flex h-screen bg-gray-50 dark:bg-mako-950 text-gray-900 dark:text-mako-50 font-body overflow-hidden selection:bg-primary/30 relative">

        <div class="absolute inset-0 z-0 pointer-events-none">
            <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-50">
            </div>
            <div
                class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] opacity-50">
            </div>
        </div>

        <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false"
            class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity">
        </div>

        <aside :class="[
            'fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-out md:relative md:translate-x-0',
            'bg-white/80 dark:bg-mako-950/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/5', // Adaptación Claro/Oscuro
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ]">

            <div class="h-24 flex items-center px-8 border-b border-gray-200 dark:border-white/5">
                <div class="flex items-center gap-3 group cursor-pointer select-none">

                    <div
                        class="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">

                        <div
                            class="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        </div>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-10 h-10 drop-shadow-md"
                            viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="miniNiunGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="#135bec" />
                                    <stop offset="100%" stop-color="#3b82f6" />
                                </linearGradient>
                            </defs>
                            <path fill="#fff"
                                d="M22 16c-3 0-6 3-6 6v56c0 3 3 6 6 6h6c3 0 6-3 6-6V22c0-3-3-6-6-6zm50 0c-3 0-6 3-6 6v56c0 3 3 6 6 6h6c3 0 6-3 6-6V22c0-3-3-6-6-6z"
                                class="group-hover:brightness-110 transition-all" />
                            <path stroke="url(#miniNiunGradient)" stroke-linecap="round" stroke-width="12"
                                d="m34 26 32 48"
                                class="transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:stroke-[14]" />
                            <g
                                class="origin-center transition-transform duration-700 ease-out group-hover:rotate-[180deg]">
                                <rect width="14" height="14" x="43" y="43" fill="#fff"
                                    class="drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all"
                                    rx="2" transform="rotate(45 50 50)" />
                            </g>
                        </svg>
                    </div>

                    <div class="flex flex-col">
                        <span
                            class="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-none group-hover:text-primary transition-colors">Niun</span>
                        <span
                            class="text-[0.65rem] font-bold text-primary tracking-[0.25em] uppercase mt-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Vault</span>
                    </div>
                </div>

                <button @click="isMobileMenuOpen = false"
                    class="ml-auto md:hidden text-gray-400 hover:text-gray-900 dark:text-mako-400 dark:hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close_small</span>
                </button>
            </div>

            <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">

                <div
                    class="px-4 mb-2 mt-2 text-[0.65rem] font-bold text-gray-400 dark:text-mako-600 uppercase tracking-widest">
                    Principal
                </div>

                <router-link to="/dashboard" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-primary dark:text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-gray-500 dark:text-mako-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">dashboard</span>
                    <span class="font-medium tracking-wide">Inicio</span>
                </router-link>

                <div
                    class="px-4 mt-8 mb-2 text-[0.65rem] font-bold text-gray-400 dark:text-mako-600 uppercase tracking-widest">
                    Gestión
                </div>

                <router-link :to="{ name: 'cuentas' }" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-primary dark:text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-gray-500 dark:text-mako-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">vpn_key</span>
                    <span class="font-medium tracking-wide">Cuentas</span>
                </router-link>

                <router-link :to="{ name: 'boveda' }" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-primary dark:text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-gray-500 dark:text-mako-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">folder_open</span>
                    <span class="font-medium tracking-wide">Bóveda</span>
                </router-link>

                <div
                    class="px-4 mt-8 mb-2 text-[0.65rem] font-bold text-gray-400 dark:text-mako-600 uppercase tracking-widest">
                    Configuración</div>

                <router-link :to="{ name: 'perfil' }" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-primary dark:text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-gray-500 dark:text-mako-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">account_circle</span>
                    <span class="font-medium tracking-wide">Mi Perfil</span>
                </router-link>

            </nav>

            <div class="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                <button @click="handleLogout"
                    class="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-mako-900/50 text-gray-500 dark:text-mako-400 hover:text-gray-900 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">logout</span>
                    <span class="font-semibold text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

            <header
                class="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-mako-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-10 h-10 drop-shadow-md"
                            viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="miniNiunGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="#135bec" />
                                    <stop offset="100%" stop-color="#3b82f6" />
                                </linearGradient>
                            </defs>
                            <path fill="#fff"
                                d="M22 16c-3 0-6 3-6 6v56c0 3 3 6 6 6h6c3 0 6-3 6-6V22c0-3-3-6-6-6zm50 0c-3 0-6 3-6 6v56c0 3 3 6 6 6h6c3 0 6-3 6-6V22c0-3-3-6-6-6z"
                                class="group-hover:brightness-110 transition-all" />
                            <path stroke="url(#miniNiunGradient)" stroke-linecap="round" stroke-width="12"
                                d="m34 26 32 48"
                                class="transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:stroke-[14]" />
                            <g
                                class="origin-center transition-transform duration-700 ease-out group-hover:rotate-[180deg]">
                                <rect width="14" height="14" x="43" y="43" fill="#fff"
                                    class="drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all"
                                    rx="2" transform="rotate(45 50 50)" />
                            </g>
                        </svg>
                    </div>
                    <span class="font-bold text-lg text-gray-900 dark:text-white">Niun</span>
                </div>
                <button @click="isMobileMenuOpen = true"
                    class="p-2 text-gray-500 hover:bg-gray-100 dark:text-mako-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </header>

            <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<style scoped>
/* Transición de páginas "Fade Up" */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(5px);
}

/* Scrollbar Minimalista - Adaptado para modo oscuro/claro usando :global(.dark) */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    /* gray-300 para modo claro */
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
    /* gray-400 */
}

/* Override para modo oscuro */
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3f3f46;
    /* mako-700 */
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #52525b;
    /* mako-600 */
}
</style>