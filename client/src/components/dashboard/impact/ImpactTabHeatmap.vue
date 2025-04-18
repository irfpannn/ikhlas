<template>
  <Card>
    <CardHeader>
      <CardTitle>Asnaf Recipients Heatmap</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-[550px] w-full">
        <AsnafHeatmap
          v-if="locations.length > 0"
          :locations="locations"
          :key="'heatmap-' + locations.length"
        />
        <div v-else class="h-full flex items-center justify-center text-muted-foreground">
          No location data available
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import AsnafHeatmap from '@/components/AsnafHeatmap.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
const props = defineProps({
  locations: { type: Array, required: true },
})
</script>
