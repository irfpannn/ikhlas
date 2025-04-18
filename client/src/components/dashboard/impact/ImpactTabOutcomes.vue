<template>
  <section>
    <h3 class="text-lg font-semibold mb-4">Outcome Metrics</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 p-2 rounded-full bg-primary/10">
              <BookIcon class="h-6 w-6 text-primary" />
            </div>
            <h4 class="font-medium">Education Support</h4>
            <div class="text-3xl font-bold mt-1">{{ outcomes.education.count }}</div>
            <p class="text-sm text-muted-foreground mt-1">
              Students supported with education expenses
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 p-2 rounded-full bg-primary/10">
              <HomeIcon class="h-6 w-6 text-primary" />
            </div>
            <h4 class="font-medium">Housing Improvement</h4>
            <div class="text-3xl font-bold mt-1">{{ outcomes.housing.count }}</div>
            <p class="text-sm text-muted-foreground mt-1">
              Families with improved housing conditions
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 p-2 rounded-full bg-primary/10">
              <HeartIcon class="h-6 w-6 text-primary" />
            </div>
            <h4 class="font-medium">Medical Assistance</h4>
            <div class="text-3xl font-bold mt-1">{{ outcomes.medical.count }}</div>
            <p class="text-sm text-muted-foreground mt-1">
              Individuals received medical treatment support
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 p-2 rounded-full bg-primary/10">
              <BriefcaseIcon class="h-6 w-6 text-primary" />
            </div>
            <h4 class="font-medium">Business Support</h4>
            <div class="text-3xl font-bold mt-1">{{ outcomes.business.count }}</div>
            <p class="text-sm text-muted-foreground mt-1">
              Small businesses or entrepreneurs supported
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { BookIcon, HomeIcon, HeartIcon, BriefcaseIcon } from 'lucide-vue-next'
const props = defineProps({
  outcomes: { type: Object, required: true },
})
</script>
