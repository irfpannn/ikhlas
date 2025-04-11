<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-slate-200 text-card-foreground flex flex-col gap-2 rounded-xl border py-6 shadow-sm',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
