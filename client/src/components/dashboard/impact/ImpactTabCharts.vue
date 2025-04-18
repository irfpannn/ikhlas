<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Distribution by Category (Doughnut Chart) -->
    <Card class="flex-col w-full h-auto">
      <CardHeader>
        <CardTitle>Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center justify-center h-auto">
        <Doughnut :data="doughnutData" :options="doughnutOptions" />
      </CardContent>
    </Card>
    <!-- Monthly Distribution Trend (Bar Chart) -->
    <Card class="flex-col w-full h-auto">
      <CardHeader>
        <CardTitle>Monthly Distribution Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar :data="barData" :options="barOptions" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ref, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const props = defineProps({
  categoryDistribution: { type: Object, required: true },
  totalDistributed: { type: Number, required: true },
  monthlyTrend: { type: Array, required: true },
  maxMonthlyAmount: { type: Number, required: true },
})

const doughnutData = computed(() => ({
  labels: Object.keys(props.categoryDistribution),
  datasets: [
    {
      label: 'Distribution by Category',
      data: Object.values(props.categoryDistribution),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#8BC34A',
        '#607D8B',
        '#F44336',
        '#00BCD4',
      ],
    },
  ],
}))

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'right' },
    title: { display: false },
  },
}

const barData = computed(() => ({
  labels: props.monthlyTrend.map((m) => m.label),
  datasets: [
    {
      label: 'Monthly Distribution (RM)',
      data: props.monthlyTrend.map((m) => m.amount),
      backgroundColor: '#4BC0C0',
      borderRadius: 6,
    },
  ],
}))

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}
</script>
