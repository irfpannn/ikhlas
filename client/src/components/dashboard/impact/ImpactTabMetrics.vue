<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Beneficiaries -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Total Beneficiaries</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center">
          <Users2Icon class="h-4 w-4 text-muted-foreground mr-2" />
          <div>
            <div class="text-2xl font-bold">{{ metrics.totalBeneficiaries }}</div>
            <p
              class="text-xs"
              :class="{
                'text-green-600': metrics.beneficiaryChange > 0,
                'text-red-600': metrics.beneficiaryChange < 0,
              }"
            >
              {{ metrics.beneficiaryChange > 0 ? '+' : '' }}{{ metrics.beneficiaryChange }}% from
              previous period
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- Total Distributed -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Total Distributed</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center">
          <BadgeDollarSignIcon class="h-4 w-4 text-muted-foreground mr-2" />
          <div>
            <div class="text-2xl font-bold">RM {{ metrics.totalDistributed.toFixed(2) }}</div>
            <p
              class="text-xs"
              :class="{
                'text-green-600': metrics.distributionChange > 0,
                'text-red-600': metrics.distributionChange < 0,
              }"
            >
              {{ metrics.distributionChange > 0 ? '+' : '' }}{{ metrics.distributionChange }}% from
              previous period
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- Average Per Beneficiary -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground"
          >Average Per Beneficiary</CardTitle
        >
      </CardHeader>
      <CardContent>
        <div class="flex items-center">
          <WalletIcon class="h-4 w-4 text-muted-foreground mr-2" />
          <div class="text-2xl font-bold">RM {{ metrics.averagePerBeneficiary.toFixed(2) }}</div>
        </div>
      </CardContent>
    </Card>
    <!-- Unique Donors -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Unique Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center">
          <Users2Icon class="h-4 w-4 text-muted-foreground mr-2" />
          <div class="text-2xl font-bold">{{ metrics.uniqueDonors }}</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users2Icon, WalletIcon, BadgeDollarSignIcon } from 'lucide-vue-next'
const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
})
</script>
