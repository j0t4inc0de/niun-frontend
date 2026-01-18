<script setup>
import { ref } from 'vue';
import api from '@/services/api/http';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['unlocked', 'close']);
const authStore = useAuthStore();

const pin = ref('');
const loading = ref(false);
const errorMsg = ref('');
const attemptsWarning = ref('');

const verifyPin = async () => {
    if (pin.value.length < 4) return;

    loading.value = true;
    errorMsg.value = '';
    attemptsWarning.value = '';

    try {
        // Endpoint que definiste: POST /api/security/
        await api.post('/api/security/', { pin_boveda: pin.value });

        // Si pasa, emitimos evento de desbloqueo
        emit('unlocked');
    } catch (err) {
        const data = err.response?.data || {};
        const detail = data.error || 'Error de PIN';

        // Lógica de muerte súbita para el PIN
        if (detail.includes('eliminada')) {
            alert("💀 CUENTA ELIMINADA: Límite de intentos excedido.");
            authStore.logout();
        } else if (detail.includes('quedan')) {
            attemptsWarning.value = `⚠️ ${detail}`;
            pin.value = ''; // Limpiar input para reintentar
        } else {
            errorMsg.value = detail;
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div class="w-full max-w-xs bg-mako-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">

            <button @click="$emit('close')" class="absolute top-4 right-4 text-mako-500 hover:text-white">
                <span class="material-symbols-outlined">close</span>
            </button>

            <div class="text-center mb-6">
                <div
                    class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                    <span class="material-symbols-outlined">lock</span>
                </div>
                <h3 class="text-lg font-bold text-white">Bóveda Bloqueada</h3>
                <p class="text-xs text-mako-400 mt-1">Ingresa tu PIN de 4 dígitos</p>
            </div>

            <div class="space-y-4">
                <input v-model="pin" type="password" maxlength="4" inputmode="numeric" placeholder="• • • •"
                    class="w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-2xl tracking-[0.5em] text-white focus:border-primary/50 focus:outline-none"
                    @keyup.enter="verifyPin" />

                <div v-if="attemptsWarning"
                    class="text-xs text-center text-red-300 font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
                    {{ attemptsWarning }}
                </div>

                <div v-if="errorMsg" class="text-xs text-center text-red-400">
                    {{ errorMsg }}
                </div>

                <button @click="verifyPin" :disabled="loading || pin.length < 4"
                    class="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                    {{ loading ? 'Verificando...' : 'Desbloquear' }}
                </button>
            </div>

            <p class="text-[0.6rem] text-mako-600 text-center mt-4">
                Error al ingresar el PIN consume intentos globales de autodestrucción.
            </p>
        </div>
    </div>
</template>