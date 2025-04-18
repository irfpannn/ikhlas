<template>
  <div class="space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b pb-4"
    >
      <h2 class="text-2xl font-bold tracking-tight">Asnaf Reports</h2>
      <div class="flex items-center gap-2">
        <Select v-model="reportStatusFilter">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="converted">Converted to Asnaf</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card v-if="loading" class="p-6 flex justify-center items-center">
      <Spinner class="mr-2" />
      <span>Loading reports...</span>
    </Card>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card v-for="report in filteredReports" :key="report.id" class="relative group shadow-md">
        <CardHeader class="pb-2 flex flex-row items-center justify-between border-b mb-2">
          <CardTitle class="text-base font-semibold">{{ report.name }}</CardTitle>
          <Badge :variant="statusVariant(report.status)">{{ report.status }}</Badge>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="text-sm text-muted-foreground space-y-1">
            <div>
              <span class="font-medium">Reported on:</span> {{ formatDate(report.reportDate) }}
            </div>
            <div><span class="font-medium">Address:</span> {{ report.address }}</div>
            <div v-if="report.phoneNumber">
              <span class="font-medium">Phone:</span> {{ report.phoneNumber }}
            </div>
            <div><span class="font-medium">Description:</span> {{ report.description }}</div>
            <div v-if="report.location">
              <span class="font-medium">Location:</span> {{ report.location.address }}
            </div>
          </div>
          <div v-if="report.images && report.images.length > 0" class="mt-2">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in report.images"
                :key="index"
                class="w-16 h-16 rounded overflow-hidden border cursor-pointer"
                @click="viewImage(image.url)"
              >
                <img :src="image.url" alt="Report evidence" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-3 items-center justify-center">
            <Button
              v-if="report.status === 'Pending'"
              size="md"
              variant="success"
              :loading="verifyingId === report.id"
              :disabled="verifyingId === report.id || rejectingId === report.id"
              @click="onVerify(report)"
            >
              <CheckIcon class="h-4 w-4 mr-1" /> Verify
            </Button>
            <Button
              v-if="report.status === 'Pending'"
              size="default"
              variant="destructive"
              :loading="rejectingId === report.id"
              :disabled="verifyingId === report.id || rejectingId === report.id"
              @click="onReject(report)"
            >
              <XIcon class="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              v-if="report.status === 'Verified'"
              size="default"
              variant="secondary"
              @click="openConvertModal(report)"
            >
              <ArrowRightIcon class="h-4 w-4 mr-1" /> Convert to Asnaf
            </Button>
            <Button size="default" variant="outline" @click="viewReportDetails(report)">
              <EyeIcon class="h-4 w-4 mr-1" /> View Details
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card
        v-if="filteredReports.length === 0"
        class="flex items-center justify-center p-8 text-muted-foreground"
      >
        No reports found matching the selected filter
      </Card>
    </div>

    <!-- Report Details Dialog -->
    <Dialog :open="!!selectedReport" @update:open="selectedReport = null">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details: {{ selectedReport?.name }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
            <div>
              <div class="mb-2">
                <Badge :variant="statusVariant(selectedReport?.status)">{{
                  selectedReport?.status
                }}</Badge>
              </div>
              <div class="text-sm text-muted-foreground space-y-1">
                <div>
                  <span class="font-medium">Reported on:</span>
                  {{ formatDate(selectedReport?.reportDate) }}
                </div>
                <div>
                  <span class="font-medium">Reported by:</span>
                  {{ selectedReport?.reportedBy || 'Anonymous' }}
                </div>
                <div v-if="selectedReport?.verifiedBy">
                  <span class="font-medium">Verified by:</span> {{ selectedReport?.verifiedBy }} on
                  {{ formatDate(selectedReport?.verifiedDate) }}
                </div>
                <div v-if="selectedReport?.rejectedBy">
                  <span class="font-medium">Rejected by:</span> {{ selectedReport?.rejectedBy }} on
                  {{ formatDate(selectedReport?.rejectedDate) }}
                </div>
              </div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground space-y-1">
                <div><span class="font-medium">Name:</span> {{ selectedReport?.name }}</div>
                <div><span class="font-medium">Address:</span> {{ selectedReport?.address }}</div>
                <div v-if="selectedReport?.phoneNumber">
                  <span class="font-medium">Phone Number:</span> {{ selectedReport?.phoneNumber }}
                </div>
                <div v-if="selectedReport?.location">
                  <span class="font-medium">Location:</span> {{ selectedReport?.location.address }}
                </div>
                <div v-if="selectedReport?.location">
                  <span class="font-medium">Coordinates:</span> Lat:
                  {{ selectedReport?.location.latitude }}, Long:
                  {{ selectedReport?.location.longitude }}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Situation Description</h3>
            <p>{{ selectedReport?.description }}</p>
            <div v-if="selectedReport?.notes" class="mt-2">
              <h4 class="font-medium">Additional Notes</h4>
              <p>{{ selectedReport?.notes }}</p>
            </div>
          </div>
          <div v-if="selectedReport?.images && selectedReport?.images.length > 0" class="mt-4">
            <h3 class="font-semibold mb-1">
              Evidence Images ({{ selectedReport?.images.length }})
            </h3>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in selectedReport.images"
                :key="index"
                class="w-24 h-24 rounded overflow-hidden border cursor-pointer"
                @click="viewImage(image.url)"
              >
                <img :src="image.url" alt="Report evidence" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>
          <div
            v-if="selectedReport?.status === 'Pending' || selectedReport?.status === 'Verified'"
            class="mt-4"
          >
            <div v-if="selectedReport?.status === 'Pending'">
              <h3 class="font-semibold mb-2">Take Action</h3>
              <Textarea
                v-model="reportActionNotes"
                placeholder="Add notes about this report"
                rows="3"
              />
              <div class="flex gap-2 mt-2">
                <Button
                  variant="success"
                  :loading="verifyingId === selectedReport?.id"
                  :disabled="
                    verifyingId === selectedReport?.id || rejectingId === selectedReport?.id
                  "
                  @click="onVerify(selectedReport)"
                  ><CheckIcon class="h-4 w-4 mr-1" /> Verify Report</Button
                >
                <Button
                  variant="destructive"
                  :loading="rejectingId === selectedReport?.id"
                  :disabled="
                    verifyingId === selectedReport?.id || rejectingId === selectedReport?.id
                  "
                  @click="onReject(selectedReport)"
                  ><XIcon class="h-4 w-4 mr-1" /> Reject Report</Button
                >
              </div>
            </div>
            <div v-if="selectedReport?.status === 'Verified'">
              <h3 class="font-semibold mb-2">Convert to Asnaf</h3>
              <p class="text-muted-foreground mb-2">
                Convert this verified report into an asnaf recipient record
              </p>
              <Button variant="secondary" @click="openConvertModal(selectedReport)"
                ><ArrowRightIcon class="h-4 w-4 mr-1" /> Convert to Asnaf</Button
              >
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Image Viewer Dialog -->
    <Dialog :open="!!selectedImage" @update:open="selectedImage = null">
      <DialogContent class="max-w-2xl p-0">
        <img :src="selectedImage" alt="Report evidence" class="w-full h-auto rounded" />
        <DialogFooter class="p-4">
          <Button variant="outline" @click="selectedImage = null">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Convert to Asnaf Dialog -->
    <Dialog :open="showConvertModal" @update:open="showConvertModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Asnaf</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <Select v-model="conversionCategory">
            <SelectTrigger><SelectValue placeholder="Select Asnaf Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Poor (Fakir)">Poor (Fakir)</SelectItem>
              <SelectItem value="Needy (Miskin)">Needy (Miskin)</SelectItem>
              <SelectItem value="Zakat Administrator (Amil)">Zakat Administrator (Amil)</SelectItem>
              <SelectItem value="New Muslim (Muallaf)">New Muslim (Muallaf)</SelectItem>
              <SelectItem value="To Free Slaves (Riqab)">To Free Slaves (Riqab)</SelectItem>
              <SelectItem value="Debtor (Gharimin)">Debtor (Gharimin)</SelectItem>
              <SelectItem value="Allah's Cause (Fi Sabilillah)"
                >Allah's Cause (Fi Sabilillah)</SelectItem
              >
              <SelectItem value="Traveler (Ibnus Sabil)">Traveler (Ibnus Sabil)</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            v-model="conversionNeeds"
            placeholder="Describe the needs of this asnaf"
            rows="4"
          />
          <DialogFooter>
            <Button variant="outline" @click="showConvertModal = false">Cancel</Button>
            <Button variant="default" @click="confirmConvertToAsnaf" :disabled="!conversionCategory"
              >Convert to Asnaf</Button
            >
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EyeIcon, CheckIcon, XIcon, ArrowRightIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps({
  reports: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['verify-report', 'reject-report', 'convert-to-asnaf', 'view-image'])

const reportStatusFilter = ref('all')
const selectedReport = ref(null)
const selectedImage = ref(null)
const showConvertModal = ref(false)
const conversionCategory = ref('')
const conversionNeeds = ref('')
const reportActionNotes = ref('')
const reportToConvert = ref(null)
const verifyingId = ref(null)
const rejectingId = ref(null)

const filteredReports = computed(() => {
  if (reportStatusFilter.value === 'all') {
    return props.reports
  }
  return props.reports.filter((report) => {
    if (reportStatusFilter.value === 'pending') return report.status === 'Pending'
    if (reportStatusFilter.value === 'verified') return report.status === 'Verified'
    if (reportStatusFilter.value === 'rejected') return report.status === 'Rejected'
    if (reportStatusFilter.value === 'converted') return report.status === 'Converted to Asnaf'
    return true
  })
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function viewReportDetails(report) {
  selectedReport.value = report
  reportActionNotes.value = report.notes || ''
}

function viewImage(imageUrl) {
  selectedImage.value = imageUrl
  emit('view-image', imageUrl)
}

function verifyReport(report) {
  emit('verify-report', report, reportActionNotes.value)
  toast.success('Report verified successfully!')
  if (selectedReport.value) {
    selectedReport.value = null
  }
}

function rejectReport(report) {
  emit('reject-report', report, reportActionNotes.value)
  toast('Report rejected.', { description: 'The report has been rejected.' })
  if (selectedReport.value) {
    selectedReport.value = null
  }
}

function openConvertModal(report) {
  reportToConvert.value = report
  conversionCategory.value = ''
  conversionNeeds.value = report.description || ''
  showConvertModal.value = true
}

function confirmConvertToAsnaf() {
  if (!conversionCategory.value) {
    toast.error('Please select an Asnaf category')
    return
  }
  emit('convert-to-asnaf', reportToConvert.value, {
    category: conversionCategory.value,
    needs: conversionNeeds.value,
  })
  toast.success('Report converted to Asnaf!')
  showConvertModal.value = false
  if (selectedReport.value) {
    selectedReport.value = null
  }
}

watch(
  () => props.reports,
  () => {
    reportStatusFilter.value = 'all'
  },
)

function statusVariant(status) {
  if (status === 'Pending') return 'warning'
  if (status === 'Verified') return 'success'
  if (status === 'Rejected') return 'destructive'
  if (status === 'Converted to Asnaf') return 'secondary'
  return 'secondary'
}

function onVerify(report) {
  verifyingId.value = report.id
  verifyReport(report)
  setTimeout(() => {
    verifyingId.value = null
  }, 1200)
}
function onReject(report) {
  rejectingId.value = report.id
  rejectReport(report)
  setTimeout(() => {
    rejectingId.value = null
  }, 1200)
}

const Spinner = {
  name: 'Spinner',
  template: `<div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full"></div>`,
}
</script>
