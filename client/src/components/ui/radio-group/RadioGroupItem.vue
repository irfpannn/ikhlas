<script setup>
import { ref, inject, onMounted, computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
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

const radioGroup = inject('radioGroup')

const isChecked = computed(() => {
  return radioGroup.selectedValue.value === props.value
})

const handleChange = () => {
  if (!props.disabled) {
    radioGroup.updateValue(props.value)
  }
}
</script>

<template>
  <div class="relative flex items-center">
    <input
      type="radio"
      :id="id"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
      class="h-4 w-4 rounded-full border-gray-300 text-primary-600 focus:ring-primary-600"
    />
  </div>
</template> 