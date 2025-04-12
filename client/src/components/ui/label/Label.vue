<script setup>
defineProps({
  for: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <label
    :for="for"
    class="block text-sm font-medium text-gray-700"
  >
    <slot></slot>
  </label>
</template> 