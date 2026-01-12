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
    username: '', email: '', password: '', confirmPassword: '',
    pregunta_seguridad: '', respuesta_seguridad: '', pin_boveda: ''
});

// --- LOGIN CON SEGURIDAD ---
const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        const respuestaEnviar = mfaStep.value ? loginForm.security_answer : '';

        await authStore.login({
            email: loginForm.email,
            password: loginForm.password,
            security_answer: respuestaEnviar
        });

        router.push('/dashboard');

    } catch (err) {
        if (err.response) console.log("Respuesta del error:", err.response.data);

        const data = err.response?.data || {};
        const code = Array.isArray(data.code) ? data.code[0] : data.code;
        const question = Array.isArray(data.question) ? data.question[0] : data.question;

        if (code === 'mfa_required') {
            mfaQuestion.value = question;
            mfaStep.value = true;
            errorMsg.value = '';
        } else {
            let mensaje = data.detail || 'Error al iniciar sesión.';
            if (Array.isArray(mensaje)) mensaje = mensaje[0];
            if (!data.detail && typeof data === 'object') {
                mensaje = Object.values(data).flat().join('\n');
            }
            errorMsg.value = mensaje;
        }
    } finally {
        loading.value = false;
    }
};

// --- REGISTRO COMPLETO ---
const handleRegister = async () => {
    loading.value = true;
    errorMsg.value = '';

    if (registerForm.password !== registerForm.confirmPassword) {
        errorMsg.value = 'Las contraseñas no coinciden.';
        loading.value = false;
        return;
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
    registerForm.password = '';
    registerForm.confirmPassword = '';
};
</script>

<template>
    <div
        class="relative flex min-h-screen w-full flex-col overflow-hidden items-center justify-center p-4 bg-mako-950 font-display antialiased text-mako-50 selection:bg-primary/30">

        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div
                class="absolute -top-[10%] -left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-40 animate-pulse">
            </div>
            <div class="absolute bottom-[10%] -right-[5%] w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] opacity-40">
            </div>
        </div>

        <div
            class="w-full max-w-sm relative z-10 bg-mako-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden transition-all duration-300">

            <div
                class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50">
            </div>

            <div class="flex flex-col items-center justify-center mb-8">
                <div
                    class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-mako-800 to-black border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)] group">
                    <div
                        class="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div>
                    <div
                        class="w-5 h-5 bg-primary rounded-sm rotate-45 transform shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    </div>
                </div>

                <h1 class="text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-md">
                    {{ isLogin ? 'Bienvenido a Niun' : 'Crear Cuenta' }}
                </h1>
                <p class="text-mako-400 text-sm font-medium tracking-wide">
                    {{ isLogin ? 'Niun drama, ni un problema' : 'Configura tu acceso seguro.' }}
                </p>
            </div>

            <form v-if="isLogin" @submit.prevent="handleLogin" class="flex flex-col gap-5">

                <div v-if="!mfaStep" class="flex flex-col gap-5">
                    <div class="group relative">
                        <label class="sr-only" for="email">Correo electrónico</label>
                        <div class="relative">
                            <input id="email" v-model="loginForm.email" type="email" required
                                placeholder="Correo electrónico"
                                class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pl-11 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none focus:ring-0 transition-all duration-200" />
                            <div
                                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mako-500 peer-focus:text-primary transition-colors">
                                <span class="material-symbols-outlined text-[20px]">mail</span>
                            </div>
                        </div>
                    </div>

                    <div class="group relative">
                        <label class="sr-only" for="password">Contraseña</label>
                        <div class="relative flex items-center">
                            <input id="password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
                                required placeholder="Contraseña"
                                class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pl-11 pr-12 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none focus:ring-0 transition-all duration-200" />
                            <div
                                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mako-500 peer-focus:text-primary transition-colors">
                                <span class="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-mako-500 hover:text-white transition-colors cursor-pointer outline-none">
                                <span class="material-symbols-outlined" style="font-size: 20px;">
                                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div
                        class="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <p class="text-[0.65rem] text-primary/80 uppercase tracking-widest font-bold mb-2">Control de
                            Seguridad
                        </p>
                        <p class="text-lg font-bold text-white">¿ {{ mfaQuestion }} ?</p>
                    </div>

                    <div class="group relative">
                        <input v-model="loginForm.security_answer" type="text" required
                            placeholder="Escribe tu respuesta..." autofocus
                            class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none focus:ring-0 transition-all duration-200 text-center" />
                    </div>

                    <button type="button" @click="mfaStep = false"
                        class="text-xs text-mako-500 hover:text-white transition-colors text-center flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Volver a contraseña
                    </button>
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-500/10 py-2.5 rounded-lg border border-red-500/20 whitespace-pre-line animate-in fade-in zoom-in-95">
                    {{ errorMsg }}
                </div>

                <div class="flex flex-col gap-6 mt-2">
                    <button type="submit" :disabled="loading"
                        class="w-full rounded-xl bg-primary py-3.5 text-center text-base font-bold text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]">
                        </div>
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <span
                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Procesando...
                        </span>
                        <span v-else>{{ mfaStep ? 'Verificar Respuesta' : 'Iniciar Sesión' }}</span>
                    </button>

                    <div v-if="!mfaStep" class="flex flex-col items-center gap-4">
                        <p class="text-sm text-mako-400">
                            ¿No tienes cuenta?
                            <button type="button" @click="toggleView"
                                class="font-bold text-white hover:text-primary hover:underline decoration-primary underline-offset-4 transition-colors ml-1">
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
                            class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                    </div>
                    <div class="group relative w-1/3">
                        <input v-model="registerForm.pin_boveda" type="text" required maxlength="4" placeholder="PIN"
                            pattern="\d{4}" title="Debe ser un PIN de 4 dígitos numéricos"
                            class="block w-full rounded-xl border border-white/10 bg-black/20 px-2 py-3.5 text-center text-base tracking-widest text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                    </div>
                </div>

                <input v-model="registerForm.email" type="email" required placeholder="Correo electrónico"
                    class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                <input v-model="registerForm.password" type="password" required placeholder="Contraseña maestra"
                    class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                <input v-model="registerForm.confirmPassword" type="password" required
                    placeholder="Confirmar contraseña"
                    class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                <div class="pt-4 border-t border-white/10 flex flex-col gap-4">
                    <p class="text-[0.65rem] text-mako-400 text-center uppercase tracking-widest font-bold">Recuperación
                    </p>
                    <input v-model="registerForm.pregunta_seguridad" type="text" required
                        placeholder="Pregunta (Ej: Nombre primer mascota)"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                    <input v-model="registerForm.respuesta_seguridad" type="text" required
                        placeholder="Respuesta secreta"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 whitespace-pre-line">
                    {{ errorMsg }}
                </div>

                <div class="flex flex-col gap-6 mt-2">
                    <button type="submit" :disabled="loading"
                        class="w-full rounded-xl bg-primary py-3.5 text-center text-base font-bold text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="loading">Creando...</span>
                        <span v-else>Registrarme</span>
                    </button>
                    <div class="flex flex-col items-center gap-4">
                        <p class="text-sm text-mako-400">
                            ¿Ya tienes cuenta?
                            <button type="button" @click="toggleView"
                                class="font-bold text-white hover:text-primary hover:underline decoration-primary underline-offset-4 transition-colors ml-1">
                                Iniciar Sesión
                            </button>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Mantengo tu fix para el autocompletado de Chrome */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #151618 inset !important;
    /* Un tono más oscuro para el relleno */
    -webkit-text-fill-color: #ffffff !important;
    caret-color: white;
    border-radius: 0.75rem;
    transition: background-color 5000s ease-in-out 0s;
}

@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>