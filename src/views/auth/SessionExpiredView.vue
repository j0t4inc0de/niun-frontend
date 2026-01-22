<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div class="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center border border-gray-700">
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-900/20 mb-6">
                <svg class="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <h2 class="text-2xl font-bold text-white mb-4">¡Ups! Sesión Finalizada</h2>

            <p class="text-gray-300 mb-2 leading-relaxed">
                Pasaste mucho tiempo inactivo sin usar la app.
            </p>
            <p class="text-gray-400 mb-8 text-sm">
                Por seguridad cerramos tu sesión para proteger tus datos.
            </p>

            <div class="mb-8 border-t border-gray-700 pt-4 w-3/4 mx-auto">
                <p class="text-gray-500 text-sm italic font-serif">
                    "La seguridad es nuestra prioridad."
                </p>
                <p class="text-gray-400 text-sm font-semibold mt-1">
                    Atte. Juan Erices
                </p>
            </div>

            <button @click="irAlLogin"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group">
                <span>Iniciar Sesión Nuevamente</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
    authStore.logout(false)
})

const irAlLogin = () => {
    router.push('/login')
}
</script>