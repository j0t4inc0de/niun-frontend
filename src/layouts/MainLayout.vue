<!-- src\layouts\MainLayout.vue -->
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
    <div class="flex h-screen bg-mako-950 text-mako-50 font-body overflow-hidden selection:bg-primary/30 relative">

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
            'fixed inset-y-0 left-0 z-50 w-72 bg-mako-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-out md:relative md:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ]">

            <div class="h-24 flex items-center px-8 border-b border-white/5">
                <div class="flex items-center gap-3 group cursor-pointer select-none">

                    <div
                        class="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">

                        <div
                            class="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        </div>

                        <svg class="w-10 h-10 drop-shadow-md" viewBox="0 0 100 100" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="miniNiunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#135bec" />
                                    <stop offset="100%" stop-color="#3b82f6" />
                                </linearGradient>
                            </defs>

                            <path
                                d="M22 16C19 16 16 19 16 22V78C16 81 19 84 22 84H28C31 84 34 81 34 78V22C34 19 31 16 28 16H22Z"
                                fill="white" class="group-hover:brightness-110 transition-all" />

                            <path
                                d="M72 16C69 16 66 19 66 22V78C66 81 69 84 72 84H78C81 84 84 81 84 78V22C84 19 81 16 78 16H72Z"
                                fill="white" class="group-hover:brightness-110 transition-all" />

                            <path d="M34 26 L66 74" stroke="url(#miniNiunGradient)" stroke-width="12"
                                stroke-linecap="round"
                                class="transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:stroke-[14]" />

                            <g
                                class="origin-center transition-transform duration-700 ease-out group-hover:rotate-[180deg]">
                                <rect x="43" y="43" width="14" height="14" rx="2" transform="rotate(45 50 50)"
                                    fill="white"
                                    class="drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all" />
                            </g>
                        </svg>
                    </div>

                    <div class="flex flex-col">
                        <span
                            class="text-xl font-bold tracking-tight text-white leading-none group-hover:text-primary-100 transition-colors">Niun</span>
                        <span
                            class="text-[0.65rem] font-bold text-primary tracking-[0.25em] uppercase mt-1 group-hover:text-white transition-colors">Vault</span>
                    </div>
                </div>

                <button @click="isMobileMenuOpen = false"
                    class="ml-auto md:hidden text-mako-400 hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close_small</span>
                </button>
            </div>

            <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">

                <div class="px-4 mb-2 mt-2 text-[0.65rem] font-bold text-mako-600 uppercase tracking-widest">Principal
                </div>

                <router-link to="/dashboard" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/15 to-transparent border-l-4 border-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">dashboard</span>
                    <span class="font-medium tracking-wide">Inicio</span>
                </router-link>

                <div class="px-4 mt-8 mb-2 text-[0.65rem] font-bold text-mako-600 uppercase tracking-widest">Gestión
                </div>

                <router-link :to="{ name: 'cuentas' }" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/15 to-transparent border-l-4 border-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">vpn_key</span>
                    <span class="font-medium tracking-wide">Cuentas</span>
                </router-link>

                <router-link :to="{ name: 'boveda' }" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/15 to-transparent border-l-4 border-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">folder_open</span>
                    <span class="font-medium tracking-wide">Bóveda</span>
                </router-link>

                <div class="px-4 mt-8 mb-2 text-[0.65rem] font-bold text-mako-600 uppercase tracking-widest">
                    Configuración</div>

                <router-link to="/perfil" @click="isMobileMenuOpen = false"
                    active-class="bg-gradient-to-r from-primary/15 to-transparent border-l-4 border-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.15)]"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-r-2xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">account_circle</span>
                    <span class="font-medium tracking-wide">Mi Perfil</span>
                </router-link>

            </nav>

            <div class="p-4 border-t border-white/5 bg-black/20">
                <button @click="handleLogout"
                    class="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-white/5 bg-mako-900/50 text-mako-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-200 group">
                    <span
                        class="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">logout</span>
                    <span class="font-semibold text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

            <header
                class="md:hidden flex items-center justify-between p-4 bg-mako-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <svg class="w-10 h-10 drop-shadow-md" viewBox="0 0 100 100" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="miniNiunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#135bec" />
                                    <stop offset="100%" stop-color="#3b82f6" />
                                </linearGradient>
                            </defs>

                            <path
                                d="M22 16C19 16 16 19 16 22V78C16 81 19 84 22 84H28C31 84 34 81 34 78V22C34 19 31 16 28 16H22Z"
                                fill="white" class="group-hover:brightness-110 transition-all" />

                            <path
                                d="M72 16C69 16 66 19 66 22V78C66 81 69 84 72 84H78C81 84 84 81 84 78V22C84 19 81 16 78 16H72Z"
                                fill="white" class="group-hover:brightness-110 transition-all" />

                            <path d="M34 26 L66 74" stroke="url(#miniNiunGradient)" stroke-width="12"
                                stroke-linecap="round"
                                class="transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:stroke-[14]" />

                            <g
                                class="origin-center transition-transform duration-700 ease-out group-hover:rotate-[180deg]">
                                <rect x="43" y="43" width="14" height="14" rx="2" transform="rotate(45 50 50)"
                                    fill="white"
                                    class="drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all" />
                            </g>
                        </svg>
                    </div>
                    <span class="font-bold text-lg text-white">Niun</span>
                </div>
                <button @click="isMobileMenuOpen = true"
                    class="p-2 text-mako-200 hover:bg-white/10 rounded-lg transition-colors">
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

/* Scrollbar Minimalista para Sidebar y Main */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3f3f46;
    /* mako-700 */
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #52525b;
    /* mako-600 */
}
</style>