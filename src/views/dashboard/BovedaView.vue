<!-- src/views/dashboard/BovedaView.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import filesService from '@/services/files';

// --- Estados ---
const archivos = ref([]);
const cargando = ref(true);
const subiendo = ref(false);
const inputArchivo = ref(null);

// --- Estado para Visualización (Preview) ---
const modalPreview = ref(false);
const previewUrl = ref(null);
const archivoActual = ref(null);
const cargandoPreview = ref(false);

// --- Constantes ---
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB exactos

// --- Carga Inicial ---
const cargarArchivos = async () => {
    cargando.value = true;
    try {
        const response = await filesService.listar();
        archivos.value = response.data;
    } catch (error) {
        console.error("Error al cargar bóveda:", error);
    } finally {
        cargando.value = false;
    }
};

onMounted(cargarArchivos);

// --- Lógica de Subida ---
const triggerUpload = () => inputArchivo.value.click();

const manejarSubida = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Validación de Peso (Frontend)
    if (file.size > MAX_SIZE_BYTES) {
        alert(`❌ El archivo excede los 50MB permitidos.\nPeso actual: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        event.target.value = ''; // Reset input
        return;
    }

    subiendo.value = true;
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('name', file.name); // Opcional

    try {
        await filesService.subir(formData);
        await cargarArchivos(); // Recargar lista
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.file?.[0] || error.response?.data?.detail || "Error al subir archivo";
        alert(`⚠️ Error: ${msg}`);
    } finally {
        subiendo.value = false;
        event.target.value = '';
    }
};

// --- Lógica de Visualización/Descarga Segura ---
const verArchivo = async (archivo) => {
    archivoActual.value = archivo;
    cargandoPreview.value = true;
    modalPreview.value = true;

    try {
        // Pedimos al backend que desencripte y envíe el blob
        const response = await filesService.descargar(archivo.id);

        // Creamos una URL temporal en memoria
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        previewUrl.value = URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error al desencriptar:", error);
        alert("No se pudo desencriptar el archivo.");
        cerrarModal();
    } finally {
        cargandoPreview.value = false;
    }
};

const descargarArchivoLocal = () => {
    if (!previewUrl.value || !archivoActual.value) return;

    // Crear enlace invisible para forzar descarga del Blob
    const link = document.createElement('a');
    link.href = previewUrl.value;
    link.download = archivoActual.value.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const cerrarModal = () => {
    modalPreview.value = false;
    // Limpiar memoria del navegador (Importante con Blobs)
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
    }
    archivoActual.value = null;
};

const eliminarArchivo = async (id) => {
    if (!confirm("¿Eliminar este archivo de la bóveda?")) return;
    try {
        await filesService.eliminar(id);
        archivos.value = archivos.value.filter(f => f.id !== id);
    } catch (error) {
        alert("Error al eliminar");
    }
};

// Limpieza si se desmonta el componente con el modal abierto
onUnmounted(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

// Utilidad para formato de tamaño
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const esImagen = (nombre) => /\.(jpg|jpeg|png|gif|webp)$/i.test(nombre);
</script>

<template>
    <div class="w-full space-y-6 pb-24 md:pb-0">

        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">Bóveda Cifrada</h3>
                <p class="text-sm text-mako-400">Archivos encriptados (.enc)</p>
            </div>

            <input type="file" ref="inputArchivo" @change="manejarSubida" class="hidden" />

            <button @click="triggerUpload" :disabled="subiendo"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                <span v-if="subiendo"
                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined">upload_file</span>
                <span class="hidden md:block">{{ subiendo ? 'Encriptando...' : 'Subir Archivo' }}</span>
            </button>
        </div>

        <div v-if="cargando" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
        </div>

        <div v-else-if="archivos.length === 0"
            class="py-12 text-center border border-white/5 rounded-[2rem] bg-white/[0.02]">
            <span class="material-symbols-outlined text-mako-600 text-4xl mb-2">encrypted</span>
            <p class="text-mako-400">Tu bóveda está vacía</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div v-for="file in archivos" :key="file.id"
                class="group relative aspect-square rounded-2xl border border-white/10 bg-black/20 hover:bg-white/5 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer text-center p-4"
                @click="verArchivo(file)">

                <span class="material-symbols-outlined text-4xl mb-2 transition-transform group-hover:scale-110"
                    :class="esImagen(file.name) ? 'text-purple-400' : 'text-blue-400'">
                    {{ esImagen(file.name) ? 'image' : 'description' }}
                </span>

                <p class="text-sm font-bold text-white truncate w-full px-2">{{ file.name }}</p>
                <p class="text-xs text-mako-500">{{ formatSize(file.size_bytes) }}</p>

                <button @click.stop="eliminarArchivo(file.id)"
                    class="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>

        <div v-if="modalPreview" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" @click="cerrarModal"></div>

            <div
                class="relative bg-mako-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">

                <div class="p-4 border-b border-white/5 flex justify-between items-center bg-mako-950/50">
                    <h4 class="text-white font-bold truncate max-w-[80%]">{{ archivoActual?.name }}</h4>
                    <button @click="cerrarModal" class="text-mako-400 hover:text-white">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="flex-1 overflow-auto flex items-center justify-center bg-black/40 min-h-[300px] p-4">
                    <div v-if="cargandoPreview" class="flex flex-col items-center gap-3">
                        <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin">
                        </div>
                        <p class="text-xs text-primary font-bold animate-pulse">DESENCRIPTANDO...</p>
                    </div>

                    <div v-else-if="previewUrl">
                        <img v-if="esImagen(archivoActual.name)" :src="previewUrl"
                            class="max-w-full max-h-[60vh] rounded-lg shadow-lg object-contain">

                        <div v-else class="text-center py-10">
                            <span class="material-symbols-outlined text-6xl text-mako-600 mb-4">lock_open</span>
                            <p class="text-mako-300">Archivo listo para descargar</p>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-white/5 bg-mako-950/50 flex justify-end gap-3">
                    <button v-if="!cargandoPreview" @click="descargarArchivoLocal"
                        class="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-colors">
                        <span class="material-symbols-outlined text-lg">download</span>
                        <span>Descargar</span>
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>