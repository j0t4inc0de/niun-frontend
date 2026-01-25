<!-- src\views\dashboard\PerfilView.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import filesService from '@/services/files';
import authService from '@/services/auth';
import SecurityPinModal from '@/components/ui/SecurityPinModal.vue';

const authStore = useAuthStore();
const router = useRouter();

// --- Estados UI ---
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const loadingAction = ref(false);

// Estado para el flujo de PIN
const showPinModal = ref(false);
const accionPendiente = ref(null); // 'boveda' | 'cuenta'

// --- Computadas ---
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

// --- Toggle Tema ---
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

const cerrarSesion = () => {
    authStore.logout();
    router.push('/login');
};

// --- Manejo de Acciones Protegidas (PIN) ---

const solicitarAccion = (tipo) => {
    accionPendiente.value = tipo;
    showPinModal.value = true; // Mostramos el modal solo aquí
};

const onPinSuccess = async () => {
    // El PIN fue correcto (evento @unlocked), ejecutamos la acción
    showPinModal.value = false;

    if (accionPendiente.value === 'boveda') {
        await vaciarBoveda();
    } else if (accionPendiente.value === 'cuenta') {
        await eliminarCuenta();
    }

    accionPendiente.value = null;
};

// --- Lógica de Destrucción ---

const vaciarBoveda = async () => {
    loadingAction.value = true;
    try {
        const lista = await filesService.listar();
        if (lista.data.length === 0) {
            alert("La bóveda ya está vacía.");
            return;
        }

        const promesas = lista.data.map(file => filesService.eliminar(file.id));
        await Promise.all(promesas);

        alert('✅ Bóveda vaciada correctamente.');
        await authStore.fetchUserProfile();

    } catch (error) {
        console.error(error);
        alert('❌ Error al vaciar la bóveda.');
    } finally {
        loadingAction.value = false;
    }
};

const eliminarCuenta = async () => {
    loadingAction.value = true;
    try {
        if (authService.eliminarCuenta) {
            await authService.eliminarCuenta();
        } else {
            console.warn("Servicio eliminarCuenta no implementado, simulando...");
        }

        authStore.logout();
        alert('Tu cuenta ha sido eliminada permanentemente.');
        router.push('/login');
    } catch (error) {
        console.error(error);
        alert('❌ No se pudo eliminar la cuenta. Contacta a soporte.');
    } finally {
        loadingAction.value = false;
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
                    <p class="text-sm text-mako-400">
                        {{ esPremium ? `Tienes acceso total a la plataforma.` : `Mejora para tener almacenamiento
                        ilimitado.` }}
                    </p>
                </div>
                <button class="px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                    :class="esPremium ? 'bg-white/5 text-white border border-white/10' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600'">
                    {{ esPremium ? 'Gestionar' : 'Mejorar Plan' }}
                </button>
            </div>
        </div>

        <div class="rounded-[2rem] border-2 border-red-500/20 bg-red-500/5 p-6 space-y-6">
            <div class="flex items-center gap-3 border-b border-red-500/10 pb-4">
                <div
                    class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 animate-pulse">
                    <span class="material-symbols-outlined">warning</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-red-400">Zona de Peligro</h3>
                    <p class="text-xs text-red-400/60">Estas acciones son irreversibles y requieren PIN.</p>
                </div>
            </div>

            <div class="space-y-3">
                <button @click="solicitarAccion('boveda')" :disabled="loadingAction"
                    class="w-full flex items-center justify-between p-4 rounded-xl bg-mako-950/50 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                    <div class="text-left">
                        <span class="block font-bold text-white group-hover:text-red-300 transition-colors">Vaciar
                            Bóveda</span>
                        <span class="text-xs text-mako-500 group-hover:text-red-400/70">Elimina todos los archivos
                            cifrados</span>
                    </div>
                    <span
                        class="material-symbols-outlined text-mako-600 group-hover:text-red-400 transition-colors">delete_forever</span>
                </button>

                <button @click="solicitarAccion('cuenta')" :disabled="loadingAction"
                    class="w-full flex items-center justify-between p-4 rounded-xl bg-mako-950/50 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                    <div class="text-left">
                        <span class="block font-bold text-white group-hover:text-red-300 transition-colors">Eliminar
                            Cuenta</span>
                        <span class="text-xs text-mako-500 group-hover:text-red-400/70">Borra usuario, plan y datos
                            permanentemente</span>
                    </div>
                    <span
                        class="material-symbols-outlined text-mako-600 group-hover:text-red-400 transition-colors">person_remove</span>
                </button>
            </div>
        </div>

        <button @click="cerrarSesion"
            class="w-full py-4 text-mako-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
        </button>

        <SecurityPinModal v-if="showPinModal" @close="showPinModal = false" @unlocked="onPinSuccess" />

    </div>
</template>