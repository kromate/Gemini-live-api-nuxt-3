<template>
    <div>
        <div :class="['status-badge', connected ? 'bg-green-500' : 'bg-red-500']">
            <span v-if="connected" class="mr-1">✅</span>
            <span v-else class="mr-1">⚠️</span>
            {{ connected ? 'Connected' : 'Disconnected' }}
        </div>
        <div v-if="!started" class="flex flex-col items-center">
            <button class="btn" @click="startConversation">Start conversation</button>
        </div>
        <div v-else class="flex flex-col items-center">
            <div v-if="aiResponding" class="flex flex-row items-end justify-center gap-1 mb-2 h-6">
                <div v-for="i in 15" :key="i" class="w-2 rounded-full bg-blue-400 global-wave-dot" :style="{
                    height: (10 + Math.abs(Math.sin(globalWavePhase + i / 2)) * 18) + 'px',
                    opacity: 0.6 + 0.4 * Math.abs(Math.sin(globalWavePhase + i / 2)),
                }"></div>
            </div>
            <p class="text-white mb-2">Listening... (Speak now)</p>
            <div class="flex flex-row items-end justify-center gap-2 mb-2 h-8">
                <div v-for="i in 5" :key="i" class="w-4 rounded-full bg-green-400 transition-all duration-100" :style="{
                    height: (12 + Math.abs(Math.sin(micVolume * 6 + i)) * 20) + 'px',
                    opacity: 0.7 + 0.3 * Math.abs(Math.sin(micVolume * 6 + i)),
                }"></div>
            </div>
            <button class="btn bg-red-500" @click="stopConversation">Stop</button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';
import { useLiveAPI } from '~/src/composables/useLiveAPI';
import { AudioRecorder } from '~/src/lib/audio-recorder';

const config = useRuntimeConfig();
const GEMINI_API_KEY = config.public.GEMINI_API_KEY;
const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

const connectionError = ref<string | null>(null);
const started = ref(false);
let recorder: any = null;
const globalWavePhase = ref(0);
let globalWaveInterval: any = null;

const {
    client,
    connect,
    disconnect,
    connected,
    volume: micVolume,
    config: liveConfig,
    setConfig,
    aiResponding,
} = useLiveAPI({ url: GEMINI_WS_URL, apiKey: GEMINI_API_KEY });

const startConversation = async () => {
    started.value = true;
    connectionError.value = null;
    micVolume.value = 0;


    // Setup Gemini client
    setConfig({
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
            responseModalities: 'audio',
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
            },
        },
        systemInstruction: {
            parts: [
                { text: 'You are my helpful assistant. Respond in a conversational manner.' },
            ],
        },
    });
    try {
        await connect();

    } catch (err: any) {
        connectionError.value = 'Failed to connect: ' + (err?.message || err);
        stopConversation();
        return;
    }

    // Setup audio recorder for input
    try {
        recorder = new AudioRecorder(16000);
        recorder.on('data', (base64: string) => {
            client.value?.sendRealtimeInput([
                {
                    mimeType: 'audio/pcm',
                    data: base64,
                },
            ]);
        });
        recorder.on('volume', (vol: number) => {
            micVolume.value = Math.min(1, vol * 2); // scale for UI
        });
        await recorder.start();
    } catch (err: any) {
        connectionError.value = 'Microphone access denied or unavailable: ' + (err?.message || err);
        stopConversation();
        return;
    }
};

const stopConversation = () => {
    started.value = false;
    micVolume.value = 0;

    if (recorder) {
        recorder.stop();
        recorder = null;
    }
    disconnect();

};

onMounted(() => {
    globalWaveInterval = setInterval(() => {
        if (aiResponding.value) {
            globalWavePhase.value += 0.2;
        }
    }, 50);
});

onUnmounted(() => {
    stopConversation();
    if (globalWaveInterval) clearInterval(globalWaveInterval);
});
</script>

<style scoped>
.btn {
    @apply bg-[#A7EE43] text-black font-bold py-2 px-4 rounded-lg;
}

.wave-dot {
    transition: height 0.1s, opacity 0.1s;
}

.global-wave-dot {
    transition: height 0.1s, opacity 0.1s;
}

.status-badge {
    @apply fixed bottom-0 p-2 inset-x-0 flex justify-center items-center text-white text-sm font-bold;

}
</style>