<script setup>
import { ref, computed, provide } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

provide('radioGroup', {
  selectedValue,
  updateValue: (value) => {
    selectedValue.value = value
  }
})
</script>

<template>
  <div class="radio-group" role="radiogroup">
    <slot></slot>
  </div>
</template> 