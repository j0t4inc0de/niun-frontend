<!-- src/views/dashboard/BovedaView.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import filesService from '@/services/files';

// --- Estados Generales ---
const archivos = ref([]);
const cargando = ref(true);
const subiendo = ref(false);
const inputArchivo = ref(null);

// --- Estado para Visualización (Galería/Preview) ---
const modalAbierto = ref(false);
const previewUrl = ref(null);
const archivoActual = ref(null);
const cargandoPreview = ref(false);
const mostrarMenuOpciones = ref(false);
const touchStart = ref(0);
const touchEnd = ref(0);

// --- Constantes ---
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// --- Computadas ---
const esImagen = (nombre) => /\.(jpg|jpeg|png|gif|webp)$/i.test(nombre);

const listaImagenes = computed(() => {
    return archivos.value.filter(f => esImagen(f.name));
});

const indiceActual = computed(() => {
    if (!archivoActual.value) return -1;
    return listaImagenes.value.findIndex(f => f.id === archivoActual.value.id);
});

const contadorTexto = computed(() => {
    if (indiceActual.value === -1) return '';
    return `${indiceActual.value + 1} / ${listaImagenes.value.length}`;
});

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

    if (file.size > MAX_SIZE_BYTES) {
        alert(`❌ El archivo excede los 50MB permitidos.`);
        event.target.value = '';
        return;
    }

    subiendo.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        await filesService.subir(formData);
        await cargarArchivos();
    } catch (error) {
        const msg = error.response?.data?.detail || "Error al subir archivo";
        alert(`⚠️ Error: ${msg}`);
    } finally {
        subiendo.value = false;
        event.target.value = '';
    }
};

// --- Lógica de Galería y Visualización ---

const limpiarUrlActual = () => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
    }
};

const cargarContenidoArchivo = async (archivo) => {
    if (!archivo) return;

    limpiarUrlActual();
    cargandoPreview.value = true;
    archivoActual.value = archivo;

    try {
        const response = await filesService.descargar(archivo.id);
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        previewUrl.value = URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error desencriptando:", error);
        alert("No se pudo cargar la imagen.");
    } finally {
        cargandoPreview.value = false;
    }
};

const abrirVisualizador = (archivo) => {
    modalAbierto.value = true;
    mostrarMenuOpciones.value = false;
    cargarContenidoArchivo(archivo);
};

const cerrarModal = () => {
    modalAbierto.value = false;
    mostrarMenuOpciones.value = false;
    setTimeout(() => {
        limpiarUrlActual();
        archivoActual.value = null;
    }, 300);
};

// --- Navegación (Siguiente / Anterior) ---
const cambiarFoto = (direccion) => {
    if (indiceActual.value === -1 || listaImagenes.value.length === 0) return;

    let nuevoIndice = indiceActual.value + direccion;

    // Lógica de Loop (Infinito)
    if (nuevoIndice >= listaImagenes.value.length) {
        nuevoIndice = 0; // Volver al inicio
    } else if (nuevoIndice < 0) {
        nuevoIndice = listaImagenes.value.length - 1;
    }

    const siguienteArchivo = listaImagenes.value[nuevoIndice];
    cargarContenidoArchivo(siguienteArchivo);
};

// --- Gestos Swipe (Táctil) ---
const handleTouchStart = (e) => {
    touchStart.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
    touchEnd.value = e.changedTouches[0].screenX;
    handleSwipe();
};

const handleSwipe = () => {
    if (!esImagen(archivoActual.value?.name)) return;
    const umbral = 50; // Mínimo de pixeles para considerar swipe
    const distancia = touchStart.value - touchEnd.value;

    if (distancia > umbral) {
        cambiarFoto(1); // Deslizar izquierda -> Siguiente
    } else if (distancia < -umbral) {
        cambiarFoto(-1); // Deslizar derecha -> Anterior
    }
};

// --- Acciones del Navbar Inferior ---

const descargarArchivo = () => {
    if (!previewUrl.value || !archivoActual.value) return;
    const link = document.createElement('a');
    link.href = previewUrl.value;
    link.download = archivoActual.value.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarMenuOpciones.value = false;
};

const compartirArchivo = async () => {
    if (!archivoActual.value) return;

    // Si el navegador soporta compartir nativo (Móvil)
    if (navigator.share && previewUrl.value) {
        try {
            const response = await fetch(previewUrl.value);
            const blob = await response.blob();
            const file = new File([blob], archivoActual.value.name, { type: blob.type });

            await navigator.share({
                files: [file],
                title: archivoActual.value.name,
            });
        } catch (error) {
            console.log('Error compartiendo o cancelado por usuario');
        }
    } else {
        alert("Tu navegador no soporta compartir nativo. Se descargará el archivo.");
        descargarArchivo();
    }
};

const eliminarArchivoActual = async () => {
    if (!archivoActual.value) return;
    if (!confirm("¿Eliminar esta foto permanentemente?")) return;

    try {
        const idEliminar = archivoActual.value.id;

        // Si hay más fotos, tratamos de ir a la siguiente antes de eliminar visualmente
        // O simplemente cerramos si es la única
        const eraLaUltima = listaImagenes.value.length === 1;

        await filesService.eliminar(idEliminar);

        // Actualizar lista local
        archivos.value = archivos.value.filter(f => f.id !== idEliminar);

        if (eraLaUltima || !esImagen(archivoActual.value.name)) {
            cerrarModal();
        } else {
            // Cargar la "siguiente" que ahora ocupará el lugar del índice actual (o el anterior si era el final)
            // Al eliminar, el array se reduce, así que el mismo índice puede apuntar a la siguiente foto
            let nuevoIndice = indiceActual.value;
            if (nuevoIndice >= listaImagenes.value.length) {
                nuevoIndice = listaImagenes.value.length - 1;
            }

            if (nuevoIndice >= 0) {
                cargarContenidoArchivo(listaImagenes.value[nuevoIndice]);
            } else {
                cerrarModal();
            }
        }

    } catch (error) {
        alert("Error al eliminar");
    }
};

// --- Utilidades ---
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

onUnmounted(() => {
    limpiarUrlActual();
});
</script>

<template>
    <div class="w-full space-y-6 pb-24 md:pb-0">

        <div
            class="flex items-center justify-between sticky top-0 z-10 dark:bg-mako-950/80 backdrop-blur-md py-2 transition-colors">
            <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Bóveda</h3>
                <p class="text-xs text-gray-500 dark:text-mako-400">Archivos cifrados</p>
            </div>

            <input type="file" ref="inputArchivo" @change="manejarSubida" class="hidden" />

            <button @click="triggerUpload" :disabled="subiendo"
                class="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                <span v-if="subiendo"
                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined">add_a_photo</span>
                <span class="hidden md:block md:ml-2">{{ subiendo ? '...' : 'Subir' }}</span>
            </button>
        </div>

        <div v-if="cargando" class="grid grid-cols-3 md:grid-cols-5 gap-1 md:gap-4">
            <div v-for="i in 5" :key="i" class="aspect-square bg-gray-200 dark:bg-white/5 animate-pulse rounded-lg">
            </div>
        </div>

        <div v-else-if="archivos.length === 0"
            class="py-20 text-center border border-gray-200 dark:border-white/5 rounded-3xl bg-gray-50 dark:bg-white/[0.02]">
            <span class="material-symbols-outlined text-gray-300 dark:text-mako-600 text-5xl mb-3">no_photography</span>
            <p class="text-gray-500 dark:text-mako-400">Sin archivos aún</p>
        </div>

        <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-4">
            <div v-for="file in archivos" :key="file.id" class="group relative aspect-square transition-all overflow-hidden cursor-pointer md:rounded-xl border
                       bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md
                       dark:bg-black/40 dark:border-white/5 dark:hover:bg-white/5" @click="abrirVisualizador(file)">

                <div class="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <span
                        class="material-symbols-outlined text-3xl md:text-4xl mb-1 opacity-90 dark:opacity-70 group-hover:scale-110 transition-transform"
                        :class="esImagen(file.name)
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-blue-600 dark:text-blue-400'">
                        {{ esImagen(file.name) ? 'image' : 'description' }}
                    </span>

                    <p
                        class="text-[0.6rem] md:text-sm font-medium text-gray-600 dark:text-mako-300 truncate w-full text-center px-1">
                        {{ file.name }}
                    </p>
                </div>
            </div>
        </div>

        <Transition name="fade">
            <div v-if="modalAbierto"
                class="fixed inset-0 z-[100] bg-black flex flex-col h-[100dvh] w-screen overflow-hidden"
                @touchstart="handleTouchStart" @touchend="handleTouchEnd">

                <nav
                    class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent">

                    <button @click="cerrarModal"
                        class="p-2 text-white hover:scale-110 active:scale-95 transition-all opacity-80 hover:opacity-100">
                        <span class="material-symbols-outlined text-3xl drop-shadow-lg">arrow_back</span>
                    </button>
                    <span v-if="esImagen(archivoActual?.name)"
                        class="text-white/90 font-medium text-sm tracking-wider font-mono bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        {{ contadorTexto }}
                    </span>

                    <div class="w-10"></div>
                </nav>

                <div class="flex-1 flex items-center justify-center relative w-full h-full p-0 md:p-10">
                    <div v-if="cargandoPreview" class="absolute inset-0 flex items-center justify-center z-0">
                        <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>

                    <img v-if="previewUrl && esImagen(archivoActual?.name) && !cargandoPreview" :src="previewUrl"
                        class="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-300 select-none"
                        @dragstart.prevent>

                    <div v-else-if="previewUrl && !cargandoPreview"
                        class="text-center p-8 bg-mako-900 rounded-2xl border border-white/10 mx-4 lg:max-w-md">
                        <span class="material-symbols-outlined text-7xl text-blue-400 mb-4">description</span>
                        <p class="text-white font-bold mb-2 text-xl truncate">{{ archivoActual?.name }}</p>
                        <p class="text-mako-400 mb-8">Vista previa no disponible para este formato.</p>
                        <button @click="descargarArchivo"
                            class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">download</span>
                            Descargar
                        </button>
                    </div>
                </div>

                <nav
                    class="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-8 pt-20 px-6">
                    <div class="flex items-center justify-evenly max-w-lg mx-auto md:justify-center md:gap-12">

                        <button @click="descargarArchivo"
                            class="p-3 text-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center drop-shadow-lg">
                            <span class="material-symbols-outlined text-3xl">download</span>
                        </button>

                        <button @click="cerrarModal"
                            class="p-3 text-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center drop-shadow-lg">
                            <span class="material-symbols-outlined text-4xl">close</span>
                        </button>

                        <div class="relative z-30">
                            <button @click.stop="mostrarMenuOpciones = !mostrarMenuOpciones"
                                class="p-3 text-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center drop-shadow-lg"
                                :class="{ 'opacity-100': mostrarMenuOpciones, 'opacity-90': !mostrarMenuOpciones }">
                                <span class="material-symbols-outlined text-3xl">more_vert</span>
                            </button>

                            <Transition name="bounce">
                                <div v-if="mostrarMenuOpciones"
                                    class="absolute bottom-full mb-4 -right-2 w-48 bg-mako-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden py-2 z-40">
                                    <button @click="eliminarArchivoActual"
                                        class="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors">
                                        <span class="material-symbols-outlined text-xl">delete</span>
                                        <span class="font-medium">Eliminar foto</span>
                                    </button>
                                </div>
                            </Transition>
                        </div>

                        <button v-if="esImagen(archivoActual?.name)" @click="cambiarFoto(1)"
                            class="p-3 text-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center drop-shadow-lg md:hidden">
                            <span class="material-symbols-outlined text-3xl">arrow_forward</span>
                        </button>

                        <button v-if="esImagen(archivoActual?.name)" @click="cambiarFoto(1)"
                            class="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:scale-110 active:scale-95 transition-all items-center drop-shadow-lg z-30 bg-black/20 hover:bg-black/40 rounded-full">
                            <span class="material-symbols-outlined text-4xl">chevron_right</span>
                        </button>
                        <button v-if="esImagen(archivoActual?.name)" @click="cambiarFoto(-1)"
                            class="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:scale-110 active:scale-95 transition-all items-center drop-shadow-lg z-30 bg-black/20 hover:bg-black/40 rounded-full">
                            <span class="material-symbols-outlined text-4xl">chevron_left</span>
                        </button>

                    </div>
                </nav>

            </div>
        </Transition>

    </div>
</template>

<style scoped>
/* Animaciones Vue Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.bounce-enter-active {
    animation: bounce-in 0.2s;
}

.bounce-leave-active {
    animation: bounce-in 0.2s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0.9) translateY(10px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

/* Ocultar scrollbar si es necesario */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>