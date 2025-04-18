<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent v-if="image" class="max-w-4xl p-0">
      <img :src="image" alt="Full size image" class="w-full h-auto" />
      <DialogFooter class="p-4">
        <Button variant="outline" @click="$emit('close')">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
const props = defineProps({
  open: { type: Boolean, required: true },
  image: { type: String, required: false },
})
</script>
