<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import filesService from '@/services/files';
import authService from '@/services/auth';

const authStore = useAuthStore();
const router = useRouter();

// --- Estados UI ---
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const showPanicModal = ref(false);
const panicLoading = ref(false);

// --- Computadas (Datos del Usuario) ---
const iniciales = computed(() => {
    const nombre = authStore.user?.usuario?.username || 'U';
    return nombre.substring(0, 2).toUpperCase();
});

const nombrePlan = computed(() => authStore.user?.plan?.nombre || 'Gratuito');
const esPremium = computed(() => authStore.user?.plan?.es_premium);

const stats = computed(() => ({
    cuentas: {
        usadas: authStore.user?.limites?.cuentas?.usadas || 0,
        total: authStore.user?.limites?.cuentas?.total || 1,
        porcentaje: Math.min(((authStore.user?.limites?.cuentas?.usadas || 0) / (authStore.user?.limites?.cuentas?.total || 1)) * 100, 100)
    },
    espacio: {
        usado: authStore.user?.limites?.almacenamiento?.usado_mb || 0,
        porcentaje: authStore.user?.limites?.almacenamiento?.porcentaje || 0
    }
}));

// --- Lógica Fácil: Tema ---
const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        isDarkMode.value = false;
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        isDarkMode.value = true;
        localStorage.setItem('theme', 'dark');
    }
};

// --- Lógica Media: Sesión ---
const cerrarSesion = () => {
    authStore.logout();
    router.push('/login');
};

// --- Lógica Difícil: Botón de Pánico ---
const ejecutarEliminarBoveda = async () => {
    if (!confirm('Esta accion es irreversible. Se borraran todos los archivos.')) return;

    panicLoading.value = true;
    try {
        // Obtenemos todos los archivos y los eliminamos uno a uno
        const lista = await filesService.listar();
        const promesas = lista.data.map(file => filesService.eliminar(file.id));
        await Promise.all(promesas);

        alert('Boveda vaciada correctamente.');
        showPanicModal.value = false;
    } catch (error) {
        console.error(error);
        alert('Error al vaciar la boveda.');
    } finally {
        panicLoading.value = false;
    }
};

const ejecutarEliminarCuenta = async () => {
    const confirmacion = prompt('Escribe BORRAR para confirmar la eliminacion de tu cuenta:');
    if (confirmacion !== 'BORRAR') return;

    panicLoading.value = true;
    try {
        // Asumimos que existe este metodo, si no, hay que crearlo en el servicio
        if (authService.eliminarCuenta) {
            await authService.eliminarCuenta();
        } else {
            throw new Error('Servicio no implementado');
        }

        authStore.logout();
        alert('Tu cuenta ha sido eliminada.');
        router.push('/login');
    } catch (error) {
        console.error(error);
        alert('No se pudo eliminar la cuenta. Contacta soporte.');
    } finally {
        panicLoading.value = false;
    }
};
</script>

<template>
    <div class="max-w-3xl mx-auto space-y-6 pb-24 md:pb-0">

        <div
            class="relative overflow-hidden rounded-[2rem] bg-mako-900 border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
            <div
                class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3">
            </div>

            <div class="relative z-10 shrink-0">
                <div
                    class="w-24 h-24 rounded-full bg-gradient-to-br from-mako-700 to-mako-800 border-4 border-mako-950 shadow-xl flex items-center justify-center">
                    <span class="text-3xl font-bold text-white tracking-widest">{{ iniciales }}</span>
                </div>
                <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-500 text-white text-[0.65rem] font-bold px-3 py-1 rounded-full shadow-lg border border-white/10 whitespace-nowrap uppercase">
                    {{ nombrePlan }}
                </div>
            </div>

            <div class="relative z-10 text-center md:text-left space-y-1">
                <h2 class="text-2xl font-bold text-white">{{ authStore.user?.usuario?.username || 'Usuario' }}</h2>
                <p class="text-mako-400 text-sm">{{ authStore.user?.usuario?.email }}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3">
                <div class="flex items-center gap-3 text-mako-300 mb-1">
                    <span class="material-symbols-outlined text-xl">vpn_key</span>
                    <span class="text-xs font-bold uppercase tracking-wider">Cuentas</span>
                </div>
                <div class="text-2xl font-bold text-white">
                    {{ stats.cuentas.usadas }}
                    <span class="text-sm text-mako-500 font-normal">/ {{ stats.cuentas.total }}</span>
                </div>
                <div class="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: stats.cuentas.porcentaje + '%' }">
                    </div>
                </div>
            </div>

            <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3">
                <div class="flex items-center gap-3 text-mako-300 mb-1">
                    <span class="material-symbols-outlined text-xl">cloud</span>
                    <span class="text-xs font-bold uppercase tracking-wider">Espacio</span>
                </div>
                <div class="text-2xl font-bold text-white">
                    {{ stats.espacio.usado }}
                    <span class="text-sm text-mako-500 font-normal">MB</span>
                </div>
                <div class="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full" :style="{ width: stats.espacio.porcentaje + '%' }">
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-mako-900/50 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden">
            <div class="px-6 py-4 border-b border-white/5 bg-mako-950/30">
                <h3 class="text-sm font-bold text-mako-400 uppercase tracking-widest">Preferencias</h3>
            </div>

            <div class="divide-y divide-white/5">
                <div class="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-mako-800 flex items-center justify-center text-white">
                            <span class="material-symbols-outlined">{{ isDarkMode ? 'dark_mode' : 'light_mode' }}</span>
                        </div>
                        <div class="text-left">
                            <p class="text-white font-medium">Apariencia</p>
                            <p class="text-xs text-mako-400">{{ isDarkMode ? 'Modo Oscuro' : 'Modo Claro' }}</p>
                        </div>
                    </div>

                    <button @click="toggleTheme"
                        class="w-12 h-6 rounded-full p-1 transition-colors duration-300 relative"
                        :class="isDarkMode ? 'bg-primary' : 'bg-mako-500'">
                        <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-1"
                            :class="isDarkMode ? 'translate-x-6' : 'translate-x-0'"></div>
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-mako-900/50 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden">
            <div class="px-6 py-4 border-b border-white/5 bg-mako-950/30">
                <h3 class="text-sm font-bold text-mako-400 uppercase tracking-widest">Plan Actual</h3>
            </div>
            <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h4 class="text-xl font-bold text-white">{{ nombrePlan }}</h4>
                    <p class="text-sm text-mako-400">{{ esPremium ? `Tienes acceso total a la plataforma.` : `Mejora
                        para tener almacenamiento ilimitado.` }}</p>
                </div>
                <button class="px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                    :class="esPremium ? 'bg-white/5 text-white border border-white/10' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600'">{{
                        esPremium ? 'Gestionar' : 'Mejorar Plan' }}
                </button>
            </div>
        </div>

        <div class="pt-8 pb-4">
            <button @click="showPanicModal = true"
                class="w-full py-4 rounded-2xl border-2 border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all font-bold flex items-center justify-center gap-3 group">
                <span class="material-symbols-outlined group-hover:animate-pulse">warning</span>
                ZONA DE PELIGRO
            </button>
        </div>

        <Transition name="slide-up">
            <div v-if="showPanicModal"
                class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showPanicModal = false"></div>

                <div
                    class="relative w-full max-w-md bg-mako-900 border-t border-white/10 sm:border sm:rounded-2xl overflow-hidden shadow-2xl">
                    <div class="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
                            <span class="material-symbols-outlined">gpp_maybe</span>
                            Opciones de Destruccion
                        </h3>
                        <button @click="showPanicModal = false" class="text-mako-400 hover:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <p class="text-sm text-mako-300 mb-4">Selecciona una accion de emergencia. Estas acciones no se
                            pueden deshacer.</p>

                        <button @click="ejecutarEliminarBoveda" :disabled="panicLoading"
                            class="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all group">
                            <div class="text-left">
                                <span class="block font-bold text-white group-hover:text-red-400">Vaciar Boveda</span>
                                <span class="text-xs text-mako-500">Elimina todos los archivos cifrados</span>
                            </div>
                            <span
                                class="material-symbols-outlined text-mako-500 group-hover:text-red-400">delete_forever</span>
                        </button>

                        <button @click="ejecutarEliminarCuenta" :disabled="panicLoading"
                            class="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all group">
                            <div class="text-left">
                                <span class="block font-bold text-white group-hover:text-red-400">Eliminar Cuenta</span>
                                <span class="text-xs text-mako-500">Borra usuario, plan y datos</span>
                            </div>
                            <span
                                class="material-symbols-outlined text-mako-500 group-hover:text-red-400">person_remove</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <button @click="cerrarSesion"
            class="w-full py-4 text-mako-500 hover:text-white transition-colors text-sm font-medium">
            Cerrar Sesion
        </button>

    </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

@media (min-width: 640px) {

    .slide-up-enter-from,
    .slide-up-leave-to {
        transform: scale(0.95);
        opacity: 0;
    }
}
</style>