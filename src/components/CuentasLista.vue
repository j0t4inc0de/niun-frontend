<script setup>
import { ref, computed, onMounted } from 'vue';
import cuentasService from '@/services/cuentas';

// Estado
const cuentas = ref([]);
const cargando = ref(true);
const error = ref(false);
const busqueda = ref('');
const idCopiado = ref(null);

// Cargar datos
onMounted(async () => {
    try {
        const response = await cuentasService.obtenerTodas();
        cuentas.value = response.data;
    } catch (err) {
        console.error("Error cargando cuentas:", err);
        error.value = true;
    } finally {
        cargando.value = false;
    }
});

// Filtrado por búsqueda
const cuentasFiltradas = computed(() => {
    if (!busqueda.value) return cuentas.value;
    const termino = busqueda.value.toLowerCase();
    return cuentas.value.filter(c =>
        c.site_name.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino)
    );
});

// Utilidad: Obtener iniciales para el icono si no hay imagen
const obtenerIniciales = (nombre) => {
    return nombre ? nombre.substring(0, 2).toUpperCase() : '??';
};

// Utilidad: Formatear fecha relativa
const tiempoRelativo = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat('es-CL', { month: 'short', day: 'numeric' }).format(fecha);
};

// Acción: Copiar contraseña
const copiarPassword = async (cuenta) => {
    try {
        await navigator.clipboard.writeText(cuenta.decrypted_password);

        // Feedback visual temporal
        idCopiado.value = cuenta.id;
        setTimeout(() => {
            idCopiado.value = null;
        }, 2000);
    } catch (err) {
        console.error('Error al copiar', err);
    }
};

// Acción: Ir al sitio
const irAlSitio = (url) => {
    if (!url) return;
    // Asegurar que tenga protocolo
    const target = url.startsWith('http') ? url : `https://${url}`;
    window.open(target, '_blank');
};
</script>

<template>
    <div class="w-full space-y-6">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">Mis Cuentas</h3>
                <p class="text-sm text-mako-400">Gestiona tus accesos seguros</p>
            </div>

            <div class="relative group w-full md:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span
                        class="material-symbols-outlined text-mako-500 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input v-model="busqueda" type="text" placeholder="Buscar cuenta..."
                    class="block w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-mako-500 focus:border-primary/50 focus:bg-white/5 focus:ring-0 transition-all outline-none backdrop-blur-sm">
            </div>
        </div>

        <div v-if="cargando" class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
        </div>

        <div v-else-if="error" class="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <span class="material-symbols-outlined text-red-400 text-3xl mb-2">cloud_off</span>
            <p class="text-red-200 font-medium">No pudimos cargar tus cuentas</p>
            <button @click="cargando = true; /* reintentar lógica */"
                class="mt-2 text-xs text-red-300 underline">Reintentar</button>
        </div>

        <div v-else-if="cuentasFiltradas.length === 0"
            class="py-12 text-center rounded-[2rem] border border-white/5 bg-white/[0.02]">
            <div class="w-16 h-16 mx-auto rounded-full bg-mako-800/50 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-mako-500 text-2xl">search_off</span>
            </div>
            <p class="text-mako-300 font-medium">No se encontraron cuentas</p>
            <p v-if="busqueda" class="text-xs text-mako-500 mt-1">Prueba con otro término de búsqueda</p>
            <p v-else class="text-xs text-mako-500 mt-1">Agrega tu primera cuenta para empezar</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">

            <div v-for="cuenta in cuentasFiltradas" :key="cuenta.id"
                class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-mako-900/60 to-black/40 backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300">

                <div
                    class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent"></div>
                </div>

                <div class="relative z-10 p-4 flex items-center gap-4">

                    <div class="shrink-0">
                        <img v-if="cuenta.site_icon_url" :src="cuenta.site_icon_url"
                            class="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10" alt="Icono"
                            @error="cuenta.site_icon_url = null">

                        <div v-else
                            class="w-12 h-12 rounded-xl bg-gradient-to-br from-mako-700 to-mako-800 border border-white/10 flex items-center justify-center shadow-inner">
                            <span class="text-lg font-bold text-white/80 tracking-widest">{{
                                obtenerIniciales(cuenta.site_name) }}</span>
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="text-base font-bold text-white truncate">{{ cuenta.site_name }}</h4>
                            <span
                                class="text-[0.6rem] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-mako-400">
                                {{ tiempoRelativo(cuenta.updated_at) }}
                            </span>
                        </div>
                        <p class="text-sm text-mako-400 truncate font-light">{{ cuenta.email }}</p>
                    </div>

                    <div class="flex items-center gap-2">

                        <button @click="copiarPassword(cuenta)"
                            class="relative p-2.5 rounded-xl transition-all duration-200 group/btn overflow-hidden"
                            :class="idCopiado === cuenta.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-mako-300 hover:bg-white/10 hover:text-white'">

                            <span class="material-symbols-outlined text-[1.25rem]"
                                v-if="idCopiado !== cuenta.id">content_copy</span>
                            <span class="material-symbols-outlined text-[1.25rem] animate-bounce" v-else>check</span>

                            <span
                                class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded text-white opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {{ idCopiado === cuenta.id ? '¡Copiado!' : 'Copiar Pass' }}
                            </span>
                        </button>

                        <button @click="irAlSitio(cuenta.site_url)"
                            class="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all duration-200 group/link">
                            <span
                                class="material-symbols-outlined text-[1.25rem] group-hover/link:rotate-45 transition-transform">arrow_outward</span>
                        </button>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>