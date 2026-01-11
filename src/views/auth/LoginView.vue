<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    errorMsg.value = '';
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);
        router.push('/dashboard');
    } catch (error) {
        errorMsg.value = 'Credenciales incorrectas.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div
        class="relative flex min-h-screen w-full flex-col overflow-hidden items-center justify-center p-4 bg-mako-950 font-display antialiased text-mako-50 selection:bg-primary/30">

        <div class="w-full max-w-sm flex flex-col gap-8 z-10">

            <div class="flex flex-col items-center justify-center mb-4">
                <div
                    class="w-16 h-16 rounded-xl border-2 border-mako-700/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-mako-900/50">
                    <div class="w-6 h-6 bg-mako-50 rotate-45 transform"></div>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Bienvenido a Niun</h1>
                <p class="text-mako-400 text-sm font-medium">Por favor ingresa tus datos.</p>
            </div>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-4">

                <div class="group relative">
                    <label class="sr-only" for="email">Correo electrónico</label>
                    <input id="email" v-model="email" type="email" required placeholder="Correo electrónico"
                        class="peer block w-full appearance-none rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none focus:ring-0 transition-colors duration-200" />
                    <div
                        class="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 peer-focus:opacity-100 transition-opacity duration-200 text-mako-400">
                        <span class="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                </div>

                <div class="group relative">
                    <label class="sr-only" for="password">Contraseña</label>
                    <div class="relative flex items-center">
                        <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required
                            placeholder="Contraseña"
                            class="peer block w-full appearance-none rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 pr-12 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none focus:ring-0 transition-colors duration-200" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-mako-500 hover:text-mako-300 transition-colors cursor-pointer outline-none">
                            <span class="material-symbols-outlined" style="font-size: 20px;">
                                {{ showPassword ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>
                    </div>
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-500/30">
                    {{ errorMsg }}
                </div>

                <div class="flex flex-col gap-6 mt-2">
                    <button type="submit" :disabled="isLoading"
                        class="w-full rounded-lg bg-mako-50 py-3.5 text-center text-base font-bold text-mako-950 shadow-lg hover:bg-white hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span v-if="isLoading">Entrando...</span>
                        <span v-else>Iniciar Sesión</span>
                    </button>

                    <div class="flex flex-col items-center gap-4">
                        <a href="#"
                            class="text-sm font-medium text-mako-500 hover:text-mako-300 transition-colors underline-offset-4 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>

                        <div class="h-px w-full bg-gradient-to-r from-transparent via-mako-700 to-transparent my-1">
                        </div>

                        <p class="text-sm text-mako-500">
                            ¿No tienes cuenta?
                            <router-link to="/register"
                                class="font-semibold text-mako-300 hover:text-white hover:underline decoration-mako-500 underline-offset-2 ml-1">
                                Crear Cuenta
                            </router-link>
                        </p>
                    </div>
                </div>
            </form>
        </div>

        <div
            class="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        </div>
    </div>
</template>

<style scoped>
/* Ajuste para el autofill del navegador usando los colores Mako */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #232529 inset !important;
    /* mako-950 */
    -webkit-text-fill-color: #f5f6f6 !important;
    /* mako-50 */
    caret-color: white;
    transition: background-color 5000s ease-in-out 0s;
}
</style>