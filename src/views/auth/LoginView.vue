<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    errorMsg.value = '';
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);
        // Si el login es exitoso, nos vamos al Dashboard
        router.push('/dashboard');
    } catch (error) {
        errorMsg.value = 'Credenciales incorrectas o error de conexión.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen px-4 bg-gray-100 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">

            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900">Bienvenido a Niun</h2>
                <p class="mt-2 text-sm text-gray-600">
                    Tu seguridad, simplificada.
                </p>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">Correo Electrónico</label>
                        <input id="email-address" v-model="email" name="email" type="email" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="correo@ejemplo.com">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Contraseña</label>
                        <input id="password" v-model="password" name="password" type="password" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Contraseña">
                    </div>
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                    {{ errorMsg }}
                </div>

                <div>
                    <button type="submit" :disabled="isLoading"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        <span v-if="isLoading">Cargando...</span>
                        <span v-else>Iniciar Sesión</span>
                    </button>
                </div>

                <div class="text-center mt-4">
                    <router-link to="/register" class="text-sm text-indigo-600 hover:text-indigo-500">
                        ¿No tienes cuenta? Regístrate aquí
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>