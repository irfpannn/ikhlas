<script setup>
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigate = (path) => {
  router.push(path)
}
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white p-2 flex justify-between items-center border-t"
  >
    <Button class="flex-col items-center h-full w-1/6" @click="navigate('/')" variant="ghost">
      <span class="text-lg">🏠</span>
      <span class="text-xs">Home</span>
    </Button>

    <Button
      class="flex-col items-center h-full w-1/6"
      variant="ghost"
      @click="navigate('/history')"
    >
      <span class="text-lg">📊</span>
      <span class="text-xs">History</span>
    </Button>

    <div class="relative w-1/5 flex justify-center">
      <Button class="bg-primary text-primary-foreground rounded-full h-full p-4 -mt-8">
        <span class="text-xl">💰</span>
      </Button>
    </div>

    <Button variant="ghost" class="flex-col items-center h-full w-1/6" @click="navigate('/pocket')">
      <span class="text-lg">🎁</span>
      <span class="text-xs">Pocket</span>
    </Button>

    <Button
      variant="ghost"
      class="flex-col items-center h-full w-1/6"
      @click="navigate('/profile')"
    >
      <span class="text-lg">👤</span>
      <span class="text-xs">Me</span>
    </Button>
  </div>
</template>
