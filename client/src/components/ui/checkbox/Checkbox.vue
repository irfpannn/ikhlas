<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isChecked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="relative flex items-center">
    <input
      type="checkbox"
      :id="id"
      :checked="isChecked"
      :disabled="disabled"
      @change="e => isChecked = e.target.checked"
      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
    />
  </div>
</template> 