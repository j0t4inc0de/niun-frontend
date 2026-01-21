<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import authService from '@/services/auth';
import { generateSecurityPDF } from '@/utils/pdfGenerator';

const router = useRouter();
const authStore = useAuthStore();

// Estados
const isLogin = ref(true);
const loading = ref(false);
const errorMsg = ref('');
const warningMsg = ref('');
const showPassword = ref(false);
const showSecurityAnswer = ref(false);

// Control de pasos
const loginStep = ref(1);
const registerStep = ref(1); // Nuevo estado para pasos de registro

const loginForm = reactive({ email: '', password: '', security_answer: '' });
const registerForm = reactive({
    username: '', email: '', password: '', confirmPassword: '',
    pregunta_seguridad: '', respuesta_seguridad: '', pin_boveda: ''
});

// --- TEXTOS DINÁMICOS (Para evitar error de Prettier) ---
const tituloHeader = computed(() => {
    if (isLogin.value) {
        return loginStep.value === 1 ? 'Bienvenido a Niun' : 'Control de Seguridad';
    }
    return registerStep.value === 1 ? 'Crear Cuenta' : 'Blindaje de Cuenta';
});

const subtituloHeader = computed(() => {
    if (isLogin.value) {
        return loginStep.value === 1 ? 'Gestión segura de credenciales' : 'Ingresa tu llave maestra.';
    }
    return registerStep.value === 1 ? 'Paso 1: Identidad' : 'Paso 2: Seguridad Extrema';
});

// --- LÓGICA DE LOGIN ---

const nextLoginStep = () => {
    if (loginForm.email && loginForm.password) {
        errorMsg.value = '';
        warningMsg.value = '';
        loginStep.value = 2;
    } else {
        errorMsg.value = "Por favor ingresa correo y contraseña.";
    }
};

const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';
    warningMsg.value = '';

    try {
        await authStore.login({
            email: loginForm.email,
            password: loginForm.password,
            security_answer: loginForm.security_answer
        });
        router.push('/dashboard');
    } catch (err) {
        const data = err.response?.data || {};
        const detail = data.detail || 'Error al iniciar sesión.';

        if (typeof detail === 'string') {
            if (detail.includes('intentos')) {
                const match = detail.match(/quedan (\d+)/);
                const intentosRestantes = match ? parseInt(match[1]) : 10;

                if (intentosRestantes <= 5) {
                    // Emojis eliminados
                    warningMsg.value = `ADVERTENCIA: Credenciales o respuesta incorrecta. Te quedan ${intentosRestantes} intentos. Al terminar tus intentos se borrarán tus datos.`;
                } else {
                    errorMsg.value = "Credenciales o respuesta de seguridad incorrecta.";
                }
            } else if (detail.includes('eliminados')) {
                errorMsg.value = "CUENTA ELIMINADA POR SEGURIDAD.";
            } else {
                errorMsg.value = detail;
            }
        } else {
            errorMsg.value = "Error de conexión o formato desconocido.";
        }
    } finally {
        loading.value = false;
    }
};

// --- LÓGICA DE REGISTRO (STEPS) ---

const nextRegisterStep = () => {
    // Validaciones paso 1
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        errorMsg.value = "Todos los campos son obligatorios.";
        return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
        errorMsg.value = 'Las contraseñas no coinciden.';
        return;
    }
    errorMsg.value = '';
    registerStep.value = 2;
};

const handleRegister = async () => {
    loading.value = true;
    errorMsg.value = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
        errorMsg.value = "Por favor, ingresa un correo electrónico válido.";
        loading.value = false;
        return;
    }

    // Validaciones paso 2
    if (registerForm.pin_boveda.length !== 4 || isNaN(registerForm.pin_boveda)) {
        errorMsg.value = 'El PIN debe ser de 4 números.';
        loading.value = false;
        return;
    }
    if (!registerForm.pregunta_seguridad || !registerForm.respuesta_seguridad) {
        errorMsg.value = "Completa las preguntas de seguridad.";
        loading.value = false;
        return;
    }

    try {
        await authService.register(registerForm);

        // Generar PDF
        generateSecurityPDF({
            username: registerForm.username,
            email: registerForm.email,
            password: registerForm.password,
            pin_boveda: registerForm.pin_boveda,
            pregunta_seguridad: registerForm.pregunta_seguridad
        });

        alert('Cuenta creada. Se ha descargado tu Kit de Recuperación.');
        toggleView();
    } catch (err) {
        if (err.response && err.response.data) {
            const errors = typeof err.response.data === 'object'
                ? Object.values(err.response.data).flat().join('\n')
                : 'Error en el registro';
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
    warningMsg.value = '';
    loginStep.value = 1;
    registerStep.value = 1; // Reset paso registro

    // Limpieza básica
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

            <div class="flex flex-col items-center justify-center mb-6">
                <div
                    class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-mako-800 to-black border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)] group">
                    <div
                        class="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div>
                    <div
                        class="w-5 h-5 bg-primary rounded-sm rotate-45 transform shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    </div>
                </div>

                <h1 class="text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-md text-center">
                    {{ tituloHeader }}
                </h1>
                <p class="text-mako-400 text-sm font-medium tracking-wide text-center">
                    {{ subtituloHeader }}
                </p>
            </div>

            <form v-if="isLogin" @submit.prevent="loginStep === 1 ? nextLoginStep() : handleLogin()"
                class="flex flex-col gap-5">

                <div v-if="loginStep === 1" class="flex flex-col gap-5 animate-in fade-in slide-in-from-left-4">
                    <div class="relative">
                        <input v-model="loginForm.email" type="email" required placeholder="Correo electrónico"
                            class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pl-11 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all" />
                        <span
                            class="material-symbols-outlined absolute left-3.5 top-3.5 text-mako-500 peer-focus:text-primary transition-colors">mail</span>
                    </div>

                    <div class="relative">
                        <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" required
                            placeholder="Contraseña"
                            class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pl-11 pr-12 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all" />
                        <span
                            class="material-symbols-outlined absolute left-3.5 top-3.5 text-mako-500 peer-focus:text-primary transition-colors">lock</span>
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-mako-500 hover:text-white transition-colors">
                            <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility'
                                }}</span>
                        </button>
                    </div>
                </div>

                <div v-else class="flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div class="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
                        <p class="text-[0.65rem] text-primary/80 uppercase tracking-widest font-bold mb-2">Verificación
                        </p>
                        <p class="text-sm text-mako-300">Ingresa tu respuesta de seguridad.</p>
                    </div>

                    <div class="relative">
                        <input v-model="loginForm.security_answer" :type="showSecurityAnswer ? 'text' : 'password'"
                            required placeholder="Tu respuesta secreta" autofocus
                            class="peer block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white placeholder-mako-600 focus:border-primary/50 focus:bg-black/40 focus:outline-none text-center transition-all" />
                        <button type="button" @click="showSecurityAnswer = !showSecurityAnswer"
                            class="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-mako-500 hover:text-white transition-colors">
                            <span class="material-symbols-outlined">{{ showSecurityAnswer ? 'visibility_off' :
                                'visibility' }}</span>
                        </button>
                    </div>

                    <button type="button" @click="loginStep = 1"
                        class="text-xs text-mako-500 hover:text-white transition-colors text-center flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-sm">arrow_back</span> Corregir datos
                    </button>
                </div>

                <div v-if="warningMsg"
                    class="text-red-200 text-sm font-bold text-center bg-red-600/20 py-3 px-2 rounded-lg border border-red-500 animate-pulse whitespace-pre-line">
                    {{ warningMsg }}
                </div>

                <div v-if="errorMsg && !warningMsg"
                    class="text-red-400 text-sm text-center bg-red-500/10 py-2.5 rounded-lg border border-red-500/20 whitespace-pre-line animate-in fade-in zoom-in-95">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full rounded-xl bg-primary py-3.5 text-center text-base font-bold text-white shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 group relative overflow-hidden">
                    <span v-if="loading">Procesando...</span>
                    <span v-else>{{ loginStep === 1 ? 'Continuar' : 'Desbloquear Bóveda' }}</span>
                </button>

                <div v-if="loginStep === 1" class="flex justify-center mt-2">
                    <button type="button" @click="toggleView"
                        class="text-sm text-mako-400 hover:text-white transition-colors">
                        ¿No tienes cuenta? <span
                            class="font-bold text-white underline decoration-primary underline-offset-4">Crear
                            Cuenta</span>
                    </button>
                </div>
            </form>

            <form v-else @submit.prevent="registerStep === 1 ? nextRegisterStep() : handleRegister()"
                class="flex flex-col gap-4">

                <div v-if="registerStep === 1" class="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4">
                    <input v-model="registerForm.username" type="text" required placeholder="Nombre de usuario"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                    <input v-model="registerForm.email" type="email" required placeholder="Correo electrónico"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                    <input v-model="registerForm.password" type="password" required placeholder="Contraseña maestra"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />

                    <input v-model="registerForm.confirmPassword" type="password" required
                        placeholder="Confirmar contraseña"
                        class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                </div>

                <div v-else class="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8">

                    <div class="text-center mb-2">
                        <h3 class="text-white font-medium">Configura tu seguridad</h3>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-medium text-mako-400 ml-1">Crea tu PIN de acceso</label>
                        <input v-model="registerForm.pin_boveda" type="tel" required maxlength="4"
                            placeholder="Ej: 2580" pattern="\d{4}" inputmode="numeric"
                            @input="registerForm.pin_boveda = registerForm.pin_boveda.replace(/\D/g, '')"
                            class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-center text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors font-mono tracking-widest" />
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-medium text-mako-400 ml-1">Crea una pregunta de seguridad</label>
                        <input v-model="registerForm.pregunta_seguridad" type="text" required
                            placeholder="Ej: ¿Nombre de mi primera mascota?"
                            class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-medium text-mako-400 ml-1">Respuesta secreta</label>
                        <input v-model="registerForm.respuesta_seguridad" type="text" required
                            placeholder="Tu respuesta"
                            class="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-mako-600 focus:border-primary/50 focus:outline-none transition-colors" />
                    </div>

                    <button type="button" @click="registerStep = 1"
                        class="text-xs text-mako-500 hover:text-white transition-colors text-center flex items-center justify-center gap-1 mt-2">
                        <span class="material-symbols-outlined text-sm">arrow_back</span> Volver a credenciales
                    </button>
                </div>

                <div v-if="errorMsg"
                    class="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 whitespace-pre-line">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full rounded-xl bg-primary py-3.5 text-center text-base font-bold text-white shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 mt-2">
                    <span v-if="loading">Registrando...</span>
                    <span v-else>{{ registerStep === 1 ? 'Siguiente Paso' : 'Finalizar' }}</span>
                </button>

                <div class="flex justify-center mt-2">
                    <button type="button" @click="toggleView"
                        class="text-sm text-mako-400 hover:text-white transition-colors">
                        ¿Ya tienes cuenta? <span
                            class="font-bold text-white underline decoration-primary underline-offset-4">Iniciar
                            Sesión</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Estilos para autocompletado del navegador */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #151618 inset !important;
    -webkit-text-fill-color: #ffffff !important;
    caret-color: white;
    border-radius: 0.75rem;
    transition: background-color 5000s ease-in-out 0s;
}
</style>