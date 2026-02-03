<!-- src/components/CuentasLista.vue -->
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import cuentasService from '@/services/cuentas'

const cuentas = ref([])
const cargando = ref(true)
const error = ref(false)
const busqueda = ref('')
const idCopiado = ref(null)

const modalAbierto = ref(false)
const modoEdicion = ref(false)
const cargandoForm = ref(false)
const idEnEdicion = ref(null)

const showPassword = ref(false)
const showSecret = ref(false)

const form = reactive({
    site_name: '',
    site_url: '',
    email: '',
    password: '',
    secret: ''
})

const cargarCuentas = async () => {
    cargando.value = true
    try {
        const response = await cuentasService.obtenerTodas()
        cuentas.value = response.data
    } catch (err) {
        console.error('Error cargando cuentas:', err)
        error.value = true
    } finally {
        cargando.value = false
    }
}

const cuentasFiltradas = computed(() => {
    if (!busqueda.value) return cuentas.value
    const termino = busqueda.value.toLowerCase()
    return cuentas.value.filter(
        (c) =>
            c.site_name.toLowerCase().includes(termino) ||
            c.email.toLowerCase().includes(termino)
    )
})

const obtenerIniciales = (nombre) => (nombre ? nombre.substring(0, 2).toUpperCase() : '??')

const tiempoRelativo = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat('es-CL', { month: 'short', day: 'numeric' }).format(fecha)
}

const copiarTexto = async (texto, idRef = null) => {
    if (!texto) return
    try {
        await navigator.clipboard.writeText(texto)
        if (idRef) {
            idCopiado.value = idRef
            setTimeout(() => {
                idCopiado.value = null
            }, 2000)
        }
    } catch (err) {
        console.error('Error al copiar', err)
    }
}

const irAlSitio = (url) => {
    if (!url) return
    const target = url.startsWith('http') ? url : `https://${url}`
    window.open(target, '_blank')
}

const eliminarCuenta = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) return
    try {
        await cuentasService.eliminar(id)
        cuentas.value = cuentas.value.filter((c) => c.id !== id)
    } catch (err) {
        console.error('Error al eliminar:', err)
        alert('No se pudo eliminar la cuenta.')
    }
}

const resetForm = () => {
    form.site_name = ''
    form.site_url = ''
    form.email = ''
    form.password = ''
    form.secret = ''
    showPassword.value = false
    showSecret.value = false
}

const abrirModalCrear = () => {
    modoEdicion.value = false
    idEnEdicion.value = null
    resetForm()
    modalAbierto.value = true
}

const abrirModalEditar = (cuenta) => {
    modoEdicion.value = true
    idEnEdicion.value = cuenta.id

    form.site_name = cuenta.site_name
    form.site_url = cuenta.site_url
    form.email = cuenta.email
    form.password = cuenta.decrypted_password

    const secretoRecibido = cuenta.decrypted_secret || ''
    form.secret = secretoRecibido.includes('Error') ? '' : secretoRecibido

    showPassword.value = false
    showSecret.value = false

    modalAbierto.value = true
}

const asegurarUrl = (url) => {
    if (!url || url.trim() === '') return null
    let urlLimpia = url.trim()
    if (!/^https?:\/\//i.test(urlLimpia)) urlLimpia = 'https://' + urlLimpia
    return urlLimpia
}

const guardarCuenta = async () => {
    cargandoForm.value = true
    try {
        const payload = {
            site_name: form.site_name,
            email: form.email,
            password: form.password,
            site_url: asegurarUrl(form.site_url),
            secret: form.secret ? form.secret : null
        }

        if (modoEdicion.value) {
            await cuentasService.actualizar(idEnEdicion.value, payload)
        } else {
            await cuentasService.crear(payload)
        }

        await cargarCuentas()
        modalAbierto.value = false
    } catch (err) {
        console.error('Error al guardar:', err)

        if (err.response && err.response.data) {
            let mensajeError = 'Error de validación:\n'
            for (const [key, value] of Object.entries(err.response.data)) {
                mensajeError += `• ${key}: ${value}\n`
            }
            alert(mensajeError)
        } else {
            alert('Ocurrió un error al conectar con el servidor.')
        }
    } finally {
        cargandoForm.value = false
    }
}

const setVhVar = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
}

onMounted(() => {
    cargarCuentas()
    setVhVar()
    window.addEventListener('resize', setVhVar, { passive: true })
    window.addEventListener('orientationchange', setVhVar, { passive: true })
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', setVhVar)
    window.removeEventListener('orientationchange', setVhVar)
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
})

watch(modalAbierto, async (open) => {
    if (open) {
        await nextTick()
        setVhVar()
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
    }
})
</script>

<template>
    <div class="w-full space-y-6 relative pb-24 md:pb-0">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Bóveda</h3>
                <p class="text-sm text-gray-500 dark:text-mako-400">Tus credenciales seguras</p>
            </div>

            <div class="flex flex-col md:flex-row gap-3">
                <div class="relative group w-full md:w-64">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span
                            class="material-symbols-outlined text-gray-400 dark:text-mako-500 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input v-model="busqueda" type="text" placeholder="Buscar..."
                        class="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 md:py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary/50 focus:ring-0 transition-all outline-none 
                   dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder-mako-500 dark:focus:bg-white/5" />
                </div>

                <button @click="abrirModalCrear"
                    class="hidden md:flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <span class="material-symbols-outlined text-[1.25rem]">add</span>
                    <span>Nueva</span>
                </button>
            </div>
        </div>

        <div v-if="cargando" class="space-y-4">
            <div v-for="i in 3" :key="i"
                class="h-24 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse border border-gray-200 dark:border-white/5">
            </div>
        </div>

        <div v-else-if="cuentasFiltradas.length === 0"
            class="py-12 text-center rounded-[2rem] border border-gray-200 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]">
            <div
                class="w-16 h-16 mx-auto rounded-full bg-gray-200 dark:bg-mako-800/50 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-gray-400 dark:text-mako-500 text-2xl">lock_open</span>
            </div>
            <p class="text-gray-500 dark:text-mako-300 font-medium">No hay cuentas aquí</p>
            <button class="md:hidden text-primary text-sm mt-2 font-bold" @click="abrirModalCrear">
                Toca el + para agregar
            </button>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
            <div v-for="cuenta in cuentasFiltradas" :key="cuenta.id"
                class="group relative overflow-hidden rounded-2xl border transition-all duration-300
               bg-white border-gray-200 hover:shadow-md hover:border-primary/30
               dark:bg-transparent dark:border-white/10 dark:bg-gradient-to-r dark:from-mako-900/60 dark:to-black/40 dark:backdrop-blur-xl dark:hover:border-white/20 dark:hover:bg-white/[0.03]">
                <div class="relative z-10 p-4 flex items-center gap-4">
                    <div class="shrink-0" @click="abrirModalEditar(cuenta)">
                        <img v-if="cuenta.site_icon_url" :src="cuenta.site_icon_url"
                            class="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10"
                            @error="cuenta.site_icon_url = null" />
                        <div v-else class="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border
                     bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200
                     dark:from-mako-700 dark:to-mako-800 dark:border-white/10">
                            <span class="text-lg font-bold text-gray-600 dark:text-white/80 tracking-widest">{{
                                obtenerIniciales(cuenta.site_name)
                                }}</span>
                        </div>
                    </div>

                    <div class="flex-1 min-w-0 cursor-pointer" @click="abrirModalEditar(cuenta)">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="text-base font-bold text-gray-900 dark:text-white truncate">
                                {{ cuenta.site_name }}
                            </h4>
                            <span v-if="cuenta.decrypted_secret"
                                class="material-symbols-outlined text-[10px] text-yellow-600 dark:text-yellow-500"
                                title="Tiene llave/secreto">key</span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-mako-400 truncate font-light">
                            {{ cuenta.email }}
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button @click.stop="copiarTexto(cuenta.decrypted_password, cuenta.id)" class="p-3 rounded-xl transition-all duration-200 active:scale-90
                     bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900
                     dark:bg-white/5 dark:text-mako-300 dark:hover:bg-white/10 dark:hover:text-white" :class="{
                        '!text-green-500 !bg-green-100 dark:!text-green-400 dark:!bg-green-500/10':
                            idCopiado === cuenta.id
                    }">
                            <span class="material-symbols-outlined text-[1.25rem]">{{
                                idCopiado === cuenta.id ? 'check' : 'content_copy'
                                }}</span>
                        </button>

                        <button @click.stop="irAlSitio(cuenta.site_url)" class="p-3 rounded-xl transition-all duration-200 active:scale-90
                     bg-gray-100 text-gray-500 hover:bg-primary hover:text-white
                     dark:bg-white/5 dark:text-mako-300 dark:hover:bg-primary dark:hover:text-white">
                            <span class="material-symbols-outlined text-[1.25rem]">arrow_outward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <button @click="abrirModalCrear"
            class="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.5)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
            <span class="material-symbols-outlined text-3xl">add</span>
        </button>

        <div v-if="modalAbierto" class="fixed inset-0 z-50">
            <div @click="modalAbierto = false"
                class="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm transition-opacity"></div>

            <div class="absolute inset-0 flex items-stretch md:items-center md:justify-center md:p-4">
                <div class="fixed inset-0 w-full overflow-hidden shadow-2xl
           bg-white dark:bg-mako-950
           flex flex-col rounded-none
           h-[calc(var(--vh,1vh)*100)]
           md:static md:inset-auto md:max-w-md md:rounded-2xl
           md:h-auto md:max-h-[90vh]
           md:border md:border-gray-200 md:dark:border-white/10">

                    <div class="flex flex-col h-full">
                        <div class="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur
                     dark:border-white/10 dark:bg-mako-950/80 pt-[env(safe-area-inset-top)]">
                            <div class="flex items-center justify-between gap-3 m-3">
                                <div class="min-w-0">
                                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                                        {{ modoEdicion ? 'Editar Cuenta' : 'Nueva Cuenta' }}
                                    </h3>
                                    <p class="text-xs text-gray-500 dark:text-mako-400">
                                        {{ modoEdicion ? 'Actualiza tus credenciales.' : 'Guarda credenciales nuevas.'
                                        }}
                                    </p>
                                </div>

                                <button @click="modalAbierto = false" type="button" class="p-2 rounded-full transition-colors shrink-0
                         bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900
                         dark:bg-white/5 dark:text-mako-400 dark:hover:text-white">
                                    <span class="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        </div>

                        <form @submit.prevent="guardarCuenta" class="flex-1 flex flex-col min-h-0">
                            <div
                                class="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div class="space-y-1.5">
                                        <label
                                            class="text-[0.65rem] font-bold text-gray-500 dark:text-mako-400 uppercase tracking-wider pl-1">Sitio
                                            / App</label>
                                        <input v-model="form.site_name" required type="text" placeholder="Ej: Netflix"
                                            autocomplete="organization" class="w-full rounded-xl px-4 py-3 sm:py-3.5 focus:border-primary focus:outline-none transition-colors
                             bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                             dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder-mako-600" />
                                    </div>

                                    <div class="space-y-1.5">
                                        <label
                                            class="text-[0.65rem] font-bold text-gray-500 dark:text-mako-400 uppercase tracking-wider pl-1">URL</label>
                                        <input v-model="form.site_url" type="text" placeholder="dominio.com"
                                            inputmode="url" autocomplete="url" class="w-full rounded-xl px-4 py-3 sm:py-3.5 focus:border-primary focus:outline-none transition-colors
                             bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                             dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder-mako-600" />
                                    </div>
                                </div>

                                <div class="space-y-1.5">
                                    <label
                                        class="text-[0.65rem] font-bold text-gray-500 dark:text-mako-400 uppercase tracking-wider pl-1">Usuario
                                        / Email</label>

                                    <div class="relative">
                                        <input v-model="form.email" required type="email"
                                            placeholder="usuario@email.com" inputmode="email" autocomplete="username"
                                            class="w-full rounded-xl px-4 py-3 sm:py-3.5 pr-12 focus:border-primary focus:outline-none transition-colors
                             bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                             dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder-mako-600" />

                                        <button type="button" @click="copiarTexto(form.email)" class="absolute inset-y-0 right-2 my-auto h-10 w-10 rounded-lg flex items-center justify-center transition-colors
                             text-gray-400 hover:text-gray-900 hover:bg-gray-100
                             dark:text-mako-500 dark:hover:text-white dark:hover:bg-white/5" aria-label="Copiar email">
                                            <span class="material-symbols-outlined text-lg">content_copy</span>
                                        </button>
                                    </div>
                                </div>

                                <div class="space-y-1.5">
                                    <label
                                        class="text-[0.65rem] font-bold text-gray-500 dark:text-mako-400 uppercase tracking-wider pl-1">Contraseña</label>

                                    <div class="relative">
                                        <input v-model="form.password" required
                                            :type="showPassword ? 'text' : 'password'" placeholder="Contraseña segura"
                                            :autocomplete="modoEdicion ? 'current-password' : 'new-password'" class="w-full rounded-xl px-4 py-3 sm:py-3.5 pr-24 focus:border-primary focus:outline-none transition-colors font-mono
                             bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                             dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder-mako-600" />

                                        <div class="absolute inset-y-0 right-2 my-auto flex items-center gap-1 rounded-lg p-0.5
                             bg-gray-200/80 dark:bg-mako-900/80">
                                            <button type="button" @click="showPassword = !showPassword" class="h-10 w-10 rounded-md flex items-center justify-center transition-colors
                               text-gray-500 hover:text-gray-900 hover:bg-white/60
                               dark:text-mako-400 dark:hover:text-white dark:hover:bg-white/10"
                                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                                                <span class="material-symbols-outlined text-lg">
                                                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                                                </span>
                                            </button>

                                            <div class="w-px h-5 bg-gray-300 dark:bg-white/10"></div>

                                            <button type="button" @click="copiarTexto(form.password)" class="h-10 w-10 rounded-md flex items-center justify-center transition-colors
                               text-gray-500 hover:text-gray-900 hover:bg-white/60
                               dark:text-mako-400 dark:hover:text-white dark:hover:bg-white/10"
                                                aria-label="Copiar contraseña">
                                                <span class="material-symbols-outlined text-lg">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="space-y-1.5">
                                    <div class="flex items-center gap-2">
                                        <label
                                            class="text-[0.65rem] font-bold text-yellow-600 dark:text-yellow-500/80 uppercase tracking-wider pl-1">Llave
                                            / Secreto (2FA)</label>
                                        <span class="text-[0.65rem] px-1.5 rounded
                             bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-mako-500">Opcional</span>
                                    </div>

                                    <div class="relative">
                                        <input v-model="form.secret" :type="showSecret ? 'text' : 'password'"
                                            placeholder="XXXX-XXXX-XXXX" autocomplete="one-time-code"
                                            class="w-full rounded-xl px-4 py-3 sm:py-3.5 pr-24 focus:outline-none transition-colors font-mono
                             bg-gray-50 border border-yellow-500/30 text-gray-900 placeholder-gray-400 focus:border-yellow-500
                             dark:bg-black/20 dark:border-yellow-500/20 dark:text-white dark:placeholder-mako-600 dark:focus:border-yellow-500/50" />

                                        <div class="absolute inset-y-0 right-2 my-auto flex items-center gap-1 rounded-lg p-0.5
                             bg-gray-200/80 dark:bg-mako-900/80">
                                            <button type="button" @click="showSecret = !showSecret" class="h-10 w-10 rounded-md flex items-center justify-center transition-colors
                               text-gray-500 hover:text-gray-900 hover:bg-white/60
                               dark:text-mako-400 dark:hover:text-white dark:hover:bg-white/10"
                                                :aria-label="showSecret ? 'Ocultar secreto' : 'Mostrar secreto'">
                                                <span class="material-symbols-outlined text-lg">
                                                    {{ showSecret ? 'visibility_off' : 'visibility' }}
                                                </span>
                                            </button>

                                            <div class="w-px h-5 bg-gray-300 dark:bg-white/10"></div>

                                            <button type="button" @click="copiarTexto(form.secret)" class="h-10 w-10 rounded-md flex items-center justify-center transition-colors
                               text-gray-500 hover:text-gray-900 hover:bg-white/60
                               dark:text-mako-400 dark:hover:text-white dark:hover:bg-white/10"
                                                aria-label="Copiar secreto">
                                                <span class="material-symbols-outlined text-lg">content_copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    <p class="text-xs text-gray-500 dark:text-mako-500">
                                        Para llaves 2FA o notas sensibles. Se guarda cifrado.
                                    </p>
                                </div>
                            </div>

                            <div class="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-white/80 backdrop-blur
                       dark:border-white/10 dark:bg-mako-950/80 pb-[env(safe-area-inset-bottom)]">
                                <div class="flex gap-3">
                                    <button type="button" v-if="modoEdicion"
                                        @click="eliminarCuenta(idEnEdicion); modalAbierto = false" class="w-12 h-12 rounded-xl border transition-colors flex items-center justify-center
                           border-red-200 text-red-500 hover:bg-red-50
                           dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                                        aria-label="Eliminar cuenta">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>

                                    <button type="submit" :disabled="cargandoForm"
                                        class="flex-1 h-12 rounded-xl  m-5 bg-primary hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2 active:scale-95">
                                        <span v-if="cargandoForm"
                                            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>{{ modoEdicion ? 'Actualizar Cuenta' : 'Guardar Cuenta' }}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
