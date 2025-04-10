<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navigate = (path) => {
  router.push(path)
}

// Check if the current route matches the given path
const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
    <div class="flex justify-around items-center h-16">
      <div 
        class="flex flex-col items-center cursor-pointer"
        :class="{ 'text-[#75a868]': isActive('/') }"
        @click="navigate('/')"
      >
        <span class="text-xl">🏠</span>
        <span class="text-xs">Home</span>
      </div>
      
      <div 
        class="flex flex-col items-center cursor-pointer"
        :class="{ 'text-[#75a868]': isActive('/categories') }"
        @click="navigate('/categories')"
      >
        <span class="text-xl">📋</span>
        <span class="text-xs">Categories</span>
      </div>
      
      <div 
        class="flex flex-col items-center cursor-pointer"
        :class="{ 'text-[#75a868]': isActive('/history') || isActive('/transaction-history') }"
        @click="navigate('/history')"
      >
        <span class="text-xl">📊</span>
        <span class="text-xs">History</span>
      </div>
      
      <div 
        class="flex flex-col items-center cursor-pointer"
        :class="{ 'text-[#75a868]': isActive('/profile') }"
        @click="navigate('/profile')"
      >
        <span class="text-xl">👤</span>
        <span class="text-xs">Profile</span>
      </div>
    </div>
  </div>
</template>
