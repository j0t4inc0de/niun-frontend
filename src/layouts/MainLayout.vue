<!-- src\layouts\MainLayout.vue -->
<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<template>
    <div class="flex h-screen bg-mako-950 text-mako-50 font-body">

        <aside class="hidden md:flex flex-col w-64 bg-mako-900 border-r border-mako-800">
            <div class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-mako-800 border border-mako-700 flex items-center justify-center">
                    <div class="w-3 h-3 bg-mako-50 rotate-45"></div>
                </div>
                <span class="text-xl font-bold tracking-tight">Niun</span>
            </div>

            <nav class="flex-1 px-4 space-y-2 mt-4">
                <router-link to="/dashboard" @click="isMobileMenuOpen = false"
                    active-class="bg-mako-800 text-white border-l-4 border-primary shadow-md"
                    class="group flex items-center gap-3 px-4 py-3.5 rounded-r-xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-mako-800/50 transition-all duration-200">
                    <span class="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
                    <span class="font-medium">Inicio</span>
                </router-link>

                <router-link to="/boveda" @click="isMobileMenuOpen = false"
                    active-class="bg-mako-800 text-white border-l-4 border-primary shadow-md"
                    class="group flex items-center gap-3 px-4 py-3.5 rounded-r-xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-mako-800/50 transition-all duration-200">
                    <span class="material-symbols-outlined group-hover:scale-110 transition-transform">lock</span>
                    <span class="font-medium">Bóveda</span>
                </router-link>

                <router-link to="/perfil" @click="isMobileMenuOpen = false"
                    active-class="bg-mako-800 text-white border-l-4 border-primary shadow-md"
                    class="group flex items-center gap-3 px-4 py-3.5 rounded-r-xl border-l-4 border-transparent text-mako-400 hover:text-white hover:bg-mako-800/50 transition-all duration-200">
                    <span class="material-symbols-outlined group-hover:scale-110 transition-transform">person</span>
                    <span class="font-medium">Mi Perfil</span>
                </router-link>
            </nav>

            <div class="p-4 border-t border-mako-800">
                <button @click="handleLogout"
                    class="flex items-center gap-3 w-full px-4 py-2 text-mako-400 hover:text-red-400 transition-colors">
                    <span class="material-symbols-outlined">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col overflow-hidden">
            <header class="md:hidden flex items-center justify-between p-4 bg-mako-900 border-b border-mako-800">
                <span class="font-bold">Niun</span>
                <button class="text-mako-50"><span class="material-symbols-outlined">menu</span></button>
            </header>

            <main class="flex-1 overflow-x-hidden overflow-y-auto p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>