<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navigateTo = (path) => {
  router.push(path)
}

// Check if the current route matches the given path
const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center">
    <div 
      class="flex flex-col items-center cursor-pointer" 
      :class="{ 'text-[#75a868]': isActive('/') }"
      @click="navigateTo('/')"
    >
      <span class="text-xl">🏠</span>
      <span class="text-xs">Utama</span>
    </div>
    <div 
      class="flex flex-col items-center cursor-pointer" 
      :class="{ 'text-[#75a868]': isActive('/history') }"
      @click="navigateTo('/history')"
    >
      <span class="text-xl">📋</span>
      <span class="text-xs">Sejarah</span>
    </div>
    <div 
      class="flex flex-col items-center cursor-pointer" 
      :class="{ 'text-[#75a868]': isActive('/asnaf-reporting') }"
      @click="navigateTo('/asnaf-reporting')"
    >
      <span class="text-xl">🙏</span>
      <span class="text-xs">Lapor Asnaf</span>
    </div>
    <div 
      class="flex flex-col items-center cursor-pointer" 
      :class="{ 'text-[#75a868]': isActive('/profile') }"
      @click="navigateTo('/profile')"
    >
      <span class="text-xl">👤</span>
      <span class="text-xs">Profil</span>
    </div>
  </div>
</template>
