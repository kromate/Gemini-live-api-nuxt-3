import { ref, computed, onMounted, onUnmounted, Ref } from 'vue'
import { MultimodalLiveClient } from '../lib/multimodal-live-client'
import { AudioStreamer } from '../lib/audio-recorder'
import { audioContext } from '../lib/utils'
import VolMeterWorket from '../lib/worklets/vol-meter'

interface UseLiveAPIOptions {
  url: string
  apiKey: string
}

export function useLiveAPI({ url, apiKey }: UseLiveAPIOptions) {
  const client = computed(() => new MultimodalLiveClient({ url, apiKey }))
  const audioStreamerRef = ref<AudioStreamer | null>(null)
  const connected = ref(false)
  const config = ref({ model: 'models/gemini-2.0-flash-exp' })
  const volume = ref(0)

  onMounted(async () => {
    if (!audioStreamerRef.value) {
      const audioCtx = await audioContext({ id: 'audio-out' })
      audioStreamerRef.value = new AudioStreamer(audioCtx)
      await audioStreamerRef.value.addWorklet('vumeter-out', VolMeterWorket, (ev: any) => {
        volume.value = ev.data.volume
      })
    }
  })

  onMounted(() => {
    const onClose = () => { connected.value = false }
    const stopAudioStreamer = () => audioStreamerRef.value?.stop()
    const onAudio = (data: ArrayBuffer) => audioStreamerRef.value?.addPCM16(new Uint8Array(data))
    client.value
      .on('close', onClose)
      .on('interrupted', stopAudioStreamer)
      .on('audio', onAudio)
    onUnmounted(() => {
      client.value
        .off('close', onClose)
        .off('interrupted', stopAudioStreamer)
        .off('audio', onAudio)
    })
  })

  const connect = async () => {
    if (!config.value) throw new Error('config has not been set')
    client.value.disconnect()
    await client.value.connect(config.value)
    connected.value = true
  }

  const disconnect = async () => {
    client.value.disconnect()
    connected.value = false
  }

  return {
    client: client.value,
    config,
    setConfig: (c: any) => { config.value = c },
    connected,
    connect,
    disconnect,
    volume,
  }
} 