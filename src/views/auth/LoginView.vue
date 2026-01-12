<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import authService from '@/services/auth';

const router = useRouter();
const authStore = useAuthStore();

// Estados de la vista
const isLogin = ref(true); // true = Login, false = Registro
const loading = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

// Estado para el "Desafío de Seguridad" (Paso 2 del Login)
const mfaStep = ref(false);
const mfaQuestion = ref('');

// Datos del formulario
const loginForm = reactive({ email: '', password: '', security_answer: '' });
const registerForm = reactive({
    username: '', email: '', password: '', confirmPassword: '', // <--- NUEVO CAMPO
    pregunta_seguridad: '', respuesta_seguridad: '', pin_boveda: ''
});

// --- LOGIN CON SEGURIDAD ---
const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        await authStore.login({
            email: loginForm.email,
            password: loginForm.password,
            security_answer: mfaStep.value ? loginForm.security_answer : null
        });
        router.push('/dashboard');
    } catch (err) {
        if (err.response && err.response.data && err.response.data.code === 'mfa_required') {
            mfaQuestion.value = err.response.data.question;
            mfaStep.value = true;
            errorMsg.value = '';
        } else {
            errorMsg.value = err.response?.data?.detail || 'Credenciales incorrectas.';
        }
    } finally {
        loading.value = false;
    }
};

// --- REGISTRO COMPLETO ---
const handleRegister = async () => {
    loading.value = true;
    errorMsg.value = '';

    // 1. VALIDACIÓN DE CONTRASEÑAS
    if (registerForm.password !== registerForm.confirmPassword) {
        errorMsg.value = 'Las contraseñas no coinciden.';
        loading.value = false;
        return; // Detenemos aquí si no son iguales
    }

    try {
        await authService.register(registerForm);
        alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
        toggleView();
    } catch (err) {
        if (err.response && err.response.data) {
            const errors = Object.values(err.response.data).flat().join('\n');
            errorMsg.value = errors;
        } else {
            errorMsg.value = 'Error de conexión';
        }
    } finally {
        loading.value = false;
    }
};

const toggleView = () => {
    isLogin.value = !isLogin.value;
    errorMsg.value = '';
    mfaStep.value = false;
    // Limpiar campos al cambiar de vista
    registerForm.password = '';
    registerForm.confirmPassword = '';
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
                <h1 class="text-2xl font-bold tracking-tight text-white mb-1">
                    {{ isLogin ? 'Bienvenido a Niun' : 'Crear Cuenta' }}
                </h1>
                <p class="text-mako-400 text-sm font-medium">
                    {{ isLogin ? 'Por favor ingresa tus datos.' : 'Configura tu acceso seguro.' }}
                </p>
            </div>

            <form v-if="isLogin" @submit.prevent="handleLogin" class="flex flex-col gap-4">

                <div v-if="!mfaStep" class="flex flex-col gap-4">
                    <div class="group relative">
                        <label class="sr-only" for="email">Correo electrónico</label>
                        <input id="email" v-model="loginForm.email" type="email" required
                            placeholder="Correo electrónico"
                            class="peer block w-full appearance-none rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none focus:ring-0 transition-colors duration-200" />
                        <div
                            class="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 peer-focus:opacity-100 transition-opacity duration-200 text-mako-400">
                            <span class="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                    </div>

                    <div class="group relative">
                        <label class="sr-only" for="password">Contraseña</label>
                        <div class="relative flex items-center">
                            <input id="password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
                                required placeholder="Contraseña"
                                class="peer block w-full appearance-none rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 pr-12 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none focus:ring-0 transition-colors duration-200" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-mako-500 hover:text-mako-300 transition-colors cursor-pointer outline-none">
                                <span class="material-symbols-outlined" style="font-size: 20px;">
                                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div class="p-4 rounded-lg border border-mako-700 bg-mako-900/30 text-center">
                        <p class="text-xs text-mako-400 uppercase tracking-widest font-bold mb-2">Control de Seguridad
                        </p>
                        <p class="text-lg font-medium text-white">¿ {{ mfaQuestion }} ?</p>
                    </div>

                    <div class="group relative">
                        <input v-model="loginForm.security_answer" type="text" required
                            placeholder="Escribe tu respuesta..." autofocus
                            class="peer block w-full appearance-none rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none focus:ring-0 transition-colors duration-200" />
                    </div>

                    <button type="button" @click="mfaStep = false"
                        class="text-sm text-mako-500 hover:text-mako-300 underline text-center">
                        Volver a contraseña
                    </button>
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-500/30 whitespace-pre-line">
                    {{ errorMsg }}
                </div>

                <div class="flex flex-col gap-6 mt-2">
                    <button type="submit" :disabled="loading"
                        class="w-full rounded-lg bg-mako-50 py-3.5 text-center text-base font-bold text-mako-950 shadow-lg hover:bg-white hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span v-if="loading">Procesando...</span>
                        <span v-else>{{ mfaStep ? 'Verificar Respuesta' : 'Iniciar Sesión' }}</span>
                    </button>

                    <div v-if="!mfaStep" class="flex flex-col items-center gap-4">
                        <a href="#"
                            class="text-sm font-medium text-mako-500 hover:text-mako-300 transition-colors underline-offset-4 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                        <div class="h-px w-full bg-gradient-to-r from-transparent via-mako-700 to-transparent my-1">
                        </div>
                        <p class="text-sm text-mako-500">
                            ¿No tienes cuenta?
                            <button type="button" @click="toggleView"
                                class="font-semibold text-mako-300 hover:text-white hover:underline decoration-mako-500 underline-offset-2 ml-1">
                                Crear Cuenta
                            </button>
                        </p>
                    </div>
                </div>
            </form>

            <form v-else @submit.prevent="handleRegister" class="flex flex-col gap-4">

                <div class="flex gap-4">
                    <div class="group relative w-2/3">
                        <input v-model="registerForm.username" type="text" required placeholder="Nombre"
                            class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />
                    </div>
                    <div class="group relative w-1/3">
                        <input v-model="registerForm.pin_boveda" type="text" required maxlength="4"
                            placeholder="PIN (4)" pattern="\d{4}" title="Debe ser un PIN de 4 dígitos numéricos"
                            class="block w-full rounded-lg border border-mako-700 bg-transparent px-2 py-3.5 text-center text-base tracking-widest text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />
                    </div>
                </div>

                <input v-model="registerForm.email" type="email" required placeholder="Correo electrónico"
                    class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />

                <input v-model="registerForm.password" type="password" required placeholder="Contraseña maestra"
                    class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />

                <input v-model="registerForm.confirmPassword" type="password" required
                    placeholder="Confirmar contraseña"
                    class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />

                <div class="pt-2 border-t border-mako-800 flex flex-col gap-4">
                    <p class="text-xs text-mako-400 text-center">Configura tu recuperación de cuenta</p>
                    <input v-model="registerForm.pregunta_seguridad" type="text" required
                        placeholder="Pregunta (Ej: Nombre primer mascota)"
                        class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />

                    <input v-model="registerForm.respuesta_seguridad" type="text" required
                        placeholder="Respuesta secreta"
                        class="block w-full rounded-lg border border-mako-700 bg-transparent px-4 py-3.5 text-base text-mako-50 placeholder-mako-500 focus:border-mako-400 focus:outline-none transition-colors" />
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-500/30 whitespace-pre-line">
                    {{ errorMsg }}
                </div>

                <div class="flex flex-col gap-6 mt-2">
                    <button type="submit" :disabled="loading"
                        class="w-full rounded-lg bg-mako-50 py-3.5 text-center text-base font-bold text-mako-950 shadow-lg hover:bg-white hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span v-if="loading">Creando...</span>
                        <span v-else>Registrarme</span>
                    </button>

                    <div class="flex flex-col items-center gap-4">
                        <p class="text-sm text-mako-500">
                            ¿Ya tienes cuenta?
                            <button type="button" @click="toggleView"
                                class="font-semibold text-mako-300 hover:text-white hover:underline decoration-mako-500 underline-offset-2 ml-1">
                                Iniciar Sesión
                            </button>
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
    -webkit-text-fill-color: #f5f6f6 !important;
    caret-color: white;
    transition: background-color 5000s ease-in-out 0s;
}
</style>