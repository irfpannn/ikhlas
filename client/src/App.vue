<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <Toaster position="top-right" />
  <RouterView />
</template>
