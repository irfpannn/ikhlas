<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Impact Stories</h3>
      <Button @click="$emit('add-story')">
        <PlusIcon class="h-4 w-4 mr-2" />
        Add New Story
      </Button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="(story, index) in stories" :key="index" class="overflow-hidden">
        <CardHeader>
          <div class="flex items-start justify-between">
            <CardTitle class="text-base">{{ story.title }}</CardTitle>
            <Badge variant="outline" class="ml-2">{{ formatDate(story.date) }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="pb-0">
          <p class="line-clamp-3 text-sm text-muted-foreground mb-4">{{ story.description }}</p>
          <div class="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <span class="text-muted-foreground">Beneficiaries:</span>
              <span class="font-medium ml-1">{{ story.beneficiaries }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Amount:</span>
              <span class="font-medium ml-1">RM {{ story.amount.toFixed(2) }}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter class="pt-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="$emit('edit-story', story)">
            <PencilIcon class="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="default" size="sm" @click="$emit('view-story', story)">
            <EyeIcon class="h-4 w-4 mr-1" />
            View
          </Button>
        </CardFooter>
      </Card>
      <!-- Add Story Card -->
      <Card
        class="flex items-center justify-center cursor-pointer border-dashed"
        @click="$emit('add-story')"
      >
        <CardContent class="flex flex-col items-center justify-center p-6">
          <div class="rounded-full bg-primary/10 p-3 mb-2">
            <PlusIcon class="h-6 w-6 text-primary" />
          </div>
          <p class="text-sm font-medium">Add New Impact Story</p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, PencilIcon, EyeIcon } from 'lucide-vue-next'
const props = defineProps({
  stories: { type: Array, required: true },
  formatDate: { type: Function, required: true },
})
</script>
