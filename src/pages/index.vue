<template>
  <div class="App">
    <LiveAPIProvider :url="uri" :apiKey="apiKey">
      <div class="streaming-console">
        <SidePanel />
        <main>
          <div class="main-app-area">
            <Altair />
            <video
              class="stream"
              :class="{ hidden: !videoStream }"
              ref="videoRef"
              autoplay
              playsinline
            />
          </div>
          <ControlTray
            :videoRef="videoRef"
            :supportsVideo="true"
            :onVideoStreamChange="setVideoStream"
            :enableEditingSettings="true"
          >
            <!-- put your own buttons here -->
          </ControlTray>
        </main>
      </div>
    </LiveAPIProvider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// These will be implemented as part of the migration
// import SidePanel from '~/components/SidePanel.vue'
// import Altair from '~/components/Altair.vue'
// import ControlTray from '~/components/ControlTray.vue'
// import LiveAPIProvider from '~/components/LiveAPIProvider.vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const videoStream = ref<MediaStream | null>(null)

const setVideoStream = (stream: MediaStream | null) => {
  videoStream.value = stream
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const uri = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`
</script>

<style scoped>
.App {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.streaming-console {
  display: flex;
  height: 100%;
}
.main-app-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.stream {
  width: 100%;
  max-height: 300px;
}
.hidden {
  display: none;
}
</style> 