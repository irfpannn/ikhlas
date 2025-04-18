<template>
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="w-full flex items-center space-x-4 sm:w-1/3">
      <Label for="timeRange" class="mb-2 block">Time Range</Label>
      <Select
        :modelValue="impactTimeRange"
        @update:modelValue="(val) => $emit('update:impactTimeRange', val)"
      >
        <SelectTrigger id="timeRange" aria-label="Select time range">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="quarter">Last Quarter</SelectItem>
          <SelectItem value="year">Last Year</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="w-full flex items-center space-x-4 sm:w-1/3">
      <Label for="categoryFilter" class="mb-2 block">Category</Label>
      <Select
        :modelValue="impactCategoryFilter"
        @update:modelValue="(val) => $emit('update:impactCategoryFilter', val)"
      >
        <SelectTrigger id="categoryFilter" aria-label="Select category">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Poor">Poor (Fakir)</SelectItem>
          <SelectItem value="Needy">Needy (Miskin)</SelectItem>
          <SelectItem value="Zakat Administrator">Zakat Administrator (Amil)</SelectItem>
          <SelectItem value="New Muslim">New Muslim (Muallaf)</SelectItem>
          <SelectItem value="Slave">To Free Slaves (Riqab)</SelectItem>
          <SelectItem value="Debtor">Debtor (Gharimin)</SelectItem>
          <SelectItem value="Allah's Cause">Allah's Cause (Fi Sabilillah)</SelectItem>
          <SelectItem value="Traveler">Traveler (Ibnus Sabil)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<script setup>
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
const props = defineProps({
  impactTimeRange: {
    type: String,
    required: true,
  },
  impactCategoryFilter: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['update:impactTimeRange', 'update:impactCategoryFilter'])
</script>
