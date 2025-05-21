import { ref, reactive, computed } from 'vue';
import { MultimodalLiveClient } from '~/src/lib/multimodal-live-client';
import type { LiveConfig } from '~/src/lib/multimodal-live-types';
import { AudioStreamer } from '~/src/lib/audio-streamer';
import { audioContext } from '~/src/lib/utils';
import VolMeterWorket from '~/src/lib/worklets/vol-meter';

export function useLiveAPI({ url, apiKey }: { url: string; apiKey: string }) {
  const client = ref<InstanceType<typeof MultimodalLiveClient> | null>(null);
  const audioStreamerRef = ref<AudioStreamer | null>(null);
  const connected = ref(false);
  const config = ref<LiveConfig>({
    model: 'models/gemini-2.0-flash-exp',
  });
  const volume = ref(0);
  const aiResponding = ref(false);
  let aiRespondingTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize client
  function initClient() {
    client.value = new MultimodalLiveClient({ url, apiKey });
  }

  // Register audio streamer and volume meter
  async function initAudioStreamer() {
    if (!audioStreamerRef.value) {
      const ctx = await audioContext({ id: 'audio-out' });
      audioStreamerRef.value = new AudioStreamer(ctx);
      await audioStreamerRef.value.addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
        volume.value = ev.data.volume;
      });
    }
  }

  // Setup event listeners
  function setupListeners() {
    if (!client.value) return;
    const onClose = () => {
      connected.value = false;
    };
    const stopAudioStreamer = () => audioStreamerRef.value?.stop();
    const onAudio = (data: ArrayBuffer) => {
      audioStreamerRef.value?.addPCM16(new Uint8Array(data));
      aiResponding.value = true;
      if (aiRespondingTimeout) clearTimeout(aiRespondingTimeout);
      aiRespondingTimeout = setTimeout(() => {
        aiResponding.value = false;
      }, 300);
    };
    client.value
      .on('close', onClose)
      .on('interrupted', stopAudioStreamer)
      .on('audio', onAudio);
    // Cleanup
    return () => {
      client.value?.off('close', onClose)
        .off('interrupted', stopAudioStreamer)
        .off('audio', onAudio);
    };
  }

  // Connect
  async function connect() {
    if (!client.value) initClient();
    await initAudioStreamer();
    if (!config.value) throw new Error('config has not been set');
    client.value?.disconnect();
    await client.value?.connect(config.value);
    connected.value = true;
    setupListeners();
  }

  // Disconnect
  async function disconnect() {
    client.value?.disconnect();
    connected.value = false;
  }

  // Set config
  function setConfig(newConfig: LiveConfig) {
    config.value = newConfig;
  }

  // Initialize client on composable use
  initClient();

  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
    aiResponding,
  };
} 