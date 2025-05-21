<template>
    <div class='w-screen h-screen flex justify-center items-center bg-black'>
        <VoiceChatGemini />
    </div>
</template>

<script setup lang="ts">
import VoiceChatGemini from '~/src/components/VoiceChatGemini.vue';
</script>

<style scoped>
.btn {
    @apply bg-[#A7EE43] text-black font-bold py-2 px-4 rounded-lg;
}
</style>