<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <Button @click="showAddDistributionModal = true">
        <PlusIcon class="h-4 w-4 mr-2" />
        Add Distribution
      </Button>
    </div>

    <Card v-if="loading" class="p-6">
      <div class="flex justify-center items-center p-8">
        <Spinner class="mr-2" />
        <span>Loading distributions...</span>
      </div>
    </Card>

    <div v-else>
      <!-- Distributions Table -->

      <Card class="bg-gray-50 p-4">
        <CardHeader v-if="zakatDistributions.length === 0">
          <CardTitle>Distributions</CardTitle>
          <CardDescription>No zakat distributions found</CardDescription>
        </CardHeader>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Category</TableHead>
              <TableHead class="text-right">Amount (RM)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="distribution in zakatDistributions"
              :key="distribution.id"
              class="hover:bg-muted/50"
            >
              <TableCell>{{ formatDate(distribution.date) }}</TableCell>
              <TableCell>{{ distribution.recipientName }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ distribution.category }}</Badge>
              </TableCell>
              <TableCell class="text-right font-medium"
                >RM {{ distribution.amountRM.toFixed(2) }}</TableCell
              >
              <TableCell class="max-w-xs truncate">{{ distribution.description }}</TableCell>
              <TableCell>
                <Button
                  v-if="distribution.sourcePayments && distribution.sourcePayments.length > 0"
                  variant="outline"
                  size="sm"
                  @click="viewSourceDetails(distribution)"
                >
                  <UsersIcon class="h-3.5 w-3.5 mr-1.5" />
                  {{ distribution.sourcePayments.length }}
                </Button>
                <span v-else class="text-muted-foreground text-sm">Not specified</span>
              </TableCell>
              <TableCell class="text-center">
                <Button
                  v-if="distribution.evidenceUrl"
                  variant="ghost"
                  size="sm"
                  @click="openUrl(distribution.evidenceUrl)"
                  class="item-center justify-center"
                >
                  <FileIcon class="h-3.5 w-3.5 item-center justify-center" />
                </Button>
                <span v-else class="text-muted-foreground text-sm">No evidence</span>
              </TableCell>
              <TableCell class="text-center">
                <Button variant="ghost" size="sm" @click="editDistribution(distribution)">
                  <PencilIcon class="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>

    <!-- Add Distribution Dialog -->
    <Dialog :open="showAddDistributionModal" @update:open="showAddDistributionModal = $event">
      <DialogContent class="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{
            editingDistribution ? 'Edit Distribution' : 'Add New Distribution'
          }}</DialogTitle>
          <DialogDescription>
            Enter distribution details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="saveDistribution" class="space-y-6">
          <div class="space-y-4">
            <!-- Recipient Selection -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="recipientSelect" class="col-span-4"
                >Recipient <span class="text-red-500">*</span></Label
              >
              <div class="col-span-4 flex gap-2">
                <Select
                  :modelValue="selectedAsnafId"
                  @update:modelValue="
                    (val) => {
                      selectedAsnafId = val
                      handleAsnafSelection()
                    }
                  "
                  class="flex-1"
                >
                  <SelectTrigger id="recipientSelect">
                    <SelectValue placeholder="Select from Asnaf list or enter manually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup
                      v-for="(asnafList, category) in groupedAsnaf"
                      :key="category"
                      :label="category"
                    >
                      <SelectItem v-for="asnaf in asnafList" :key="asnaf.id" :value="asnaf.id">
                        {{ asnaf.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" @click="$emit('show-add-asnaf-modal')">
                  <PlusIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Recipient Name -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="recipientName" class="col-span-4"
                >Recipient Name <span class="text-red-500">*</span></Label
              >
              <Input
                id="recipientName"
                v-model="distributionForm.recipientName"
                class="col-span-4"
                required
              />
            </div>

            <!-- Category Selection -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="category" class="col-span-4"
                >Category <span class="text-red-500">*</span></Label
              >
              <Select
                :modelValue="distributionForm.category"
                @update:modelValue="(val) => (distributionForm.category = val)"
                class="col-span-4"
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
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

            <!-- Recipient Details Preview -->
            <div v-if="selectedAsnafDetails" class="border rounded-lg p-4 bg-muted/50 space-y-2">
              <div class="font-medium">Recipient Details</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-muted-foreground">Contact:</span>
                  {{ selectedAsnafDetails.contact }}
                </div>
                <div>
                  <span class="text-muted-foreground">Location:</span>
                  {{ selectedAsnafDetails.location }}
                </div>
                <div class="col-span-2">
                  <span class="text-muted-foreground">Needs:</span> {{ selectedAsnafDetails.needs }}
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="amountRM" class="col-span-4"
                >Amount (RM) <span class="text-red-500">*</span></Label
              >
              <Input
                id="amountRM"
                v-model="distributionForm.amountRM"
                type="number"
                step="0.01"
                min="0"
                class="col-span-4"
                required
              />
            </div>

            <!-- Description -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="description" class="col-span-4"
                >Description <span class="text-red-500">*</span></Label
              >
              <Textarea
                id="description"
                v-model="distributionForm.description"
                class="col-span-4"
                rows="3"
                required
              />
            </div>

            <!-- Evidence Upload -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="evidence" class="col-span-4">Evidence (Image/PDF)</Label>
              <div class="col-span-4 space-y-2">
                <Input
                  id="evidence"
                  type="file"
                  @change="handleFileUpload"
                  accept="image/*,application/pdf"
                />
                <div
                  v-if="uploadProgress > 0 && uploadProgress < 100"
                  class="w-full bg-muted rounded-full h-2 mt-2"
                >
                  <div
                    class="bg-primary h-full rounded-full transition-all"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <div v-if="distributionForm.evidenceUrl" class="pt-2">
                  <Button
                    variant="link"
                    @click="openUrl(distributionForm.evidenceUrl)"
                    class="p-0 h-auto"
                  >
                    <FileIcon class="h-4 w-4 mr-1" />
                    View Current Evidence
                  </Button>
                </div>
              </div>
            </div>

            <!-- Source of Funds -->
            <div class="space-y-4">
              <div>
                <h4 class="font-medium text-sm">Source of Funds</h4>
                <div class="text-sm text-muted-foreground">
                  Available Zakat Funds:
                  <span class="font-medium">RM {{ availableZakatFunds.toFixed(2) }}</span>
                </div>
              </div>

              <div class="border rounded-lg p-4 space-y-3">
                <div class="space-y-1">
                  <h5 class="font-medium text-sm">Select Source Payments</h5>
                  <p class="text-xs text-muted-foreground">
                    Select which donations to use for this distribution
                  </p>
                </div>

                <div v-if="loading" class="flex justify-center items-center py-4">
                  <Spinner class="mr-2" />
                  <span>Loading available payments...</span>
                </div>

                <Alert v-else-if="availablePayments.length === 0" variant="warning">
                  <AlertCircleIcon class="h-4 w-4" />
                  <AlertTitle>No available payments</AlertTitle>
                  <AlertDescription
                    >There are no payment sources available to allocate.</AlertDescription
                  >
                </Alert>

                <div v-else class="space-y-2 max-h-52 overflow-y-auto pr-2">
                  <div
                    v-for="payment in availablePayments"
                    :key="payment.id"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                  >
                    <Checkbox
                      :id="`payment-${payment.id}`"
                      :checked="selectedPaymentIds.includes(payment.id)"
                      @update:checked="
                        (checked) => {
                          selectedPaymentIds = checked
                            ? [...selectedPaymentIds, payment.id]
                            : selectedPaymentIds.filter((id) => id !== payment.id)
                          updateSelectedAmount()
                        }
                      "
                    />
                    <Label :for="`payment-${payment.id}`" class="flex-1 cursor-pointer">
                      <div class="flex flex-col text-sm">
                        <div class="flex justify-between">
                          <span class="font-medium">{{ payment.userName }}</span>
                          <span class="font-medium text-primary"
                            >RM {{ payment.amountRM.toFixed(2) }}</span
                          >
                        </div>
                        <div class="flex justify-between text-xs text-muted-foreground">
                          <span>{{ formatDate(payment.date) }}</span>
                          <span
                            >{{ payment.walletAddress.substring(0, 8) }}...{{
                              payment.walletAddress.substring(payment.walletAddress.length - 6)
                            }}</span
                          >
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>

                <div class="pt-2 border-t mt-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">Selected Amount:</span>
                    <span class="font-medium">RM {{ selectedAmount.toFixed(2) }}</span>
                  </div>
                  <div
                    class="text-xs mt-1"
                    :class="
                      selectedAmount >= distributionForm.amountRM
                        ? 'text-green-600'
                        : 'text-destructive'
                    "
                  >
                    {{
                      selectedAmount >= distributionForm.amountRM
                        ? '✓ Sufficient funds selected'
                        : '⚠️ Insufficient funds selected'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDistributionModal">Cancel</Button>
            <Button
              type="submit"
              :disabled="uploading || selectedAmount < distributionForm.amountRM"
            >
              <Spinner v-if="uploading" class="mr-2 h-4 w-4" />
              {{ editingDistribution ? 'Update Distribution' : 'Save Distribution' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Source Payments Details Dialog -->
    <Dialog
      :open="!!selectedDistribution"
      @update:open="
        (value) => {
          if (!value) selectedDistribution = null
        }
      "
    >
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Distribution Source Details</DialogTitle>
          <DialogDescription>
            Details for the selected distribution and its source payments
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <Card>
            <CardContent class="p-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <span class="text-muted-foreground">Recipient:</span>
                {{ selectedDistribution?.recipientName }}
              </div>
              <div>
                <span class="text-muted-foreground">Amount:</span> RM
                {{ selectedDistribution?.amountRM.toFixed(2) }}
              </div>
              <div>
                <span class="text-muted-foreground">Date:</span>
                {{ selectedDistribution ? formatDate(selectedDistribution.date) : '' }}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 class="text-lg font-semibold mb-2">Source Payments</h3>
            <div class="space-y-3">
              <Card v-for="(source, index) in selectedDistributionSources" :key="index">
                <CardContent class="p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ source.userName }}</span>
                    <Badge>RM {{ source.amountRM.toFixed(2) }}</Badge>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-muted-foreground">Date:</span> {{ formatDate(source.date) }}
                    </div>
                    <div>
                      <span class="text-muted-foreground">Transaction ID:</span>
                      {{ source.transactionId }}
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-muted-foreground">Wallet:</span>
                      <code class="bg-muted px-1 py-0.5 rounded text-xs ml-1 font-mono">{{
                        source.walletAddress
                      }}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="selectedDistribution = null">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent } from 'vue'
import { AlertCircleIcon, FileIcon, PencilIcon, PlusIcon, UsersIcon } from 'lucide-vue-next'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// Simple spinner component for loading states
const Spinner = defineComponent({
  name: 'Spinner',
  template: `
    <div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full"></div>
  `,
})

// Props, emits, and composition API code
const props = defineProps({
  zakatDistributions: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  groupedAsnaf: {
    type: Object,
    required: true,
  },
  availablePayments: {
    type: Array,
    required: true,
  },
  availableZakatFunds: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'save-distribution',
  'show-add-asnaf-modal',
  'handle-file-upload',
  'handle-asnaf-selection',
])

// Keep all the existing refs and functions from the original component
const showAddDistributionModal = ref(false)
const editingDistribution = ref(null)
const selectedAsnafId = ref('')
const selectedAsnafDetails = ref(null)
const selectedPaymentIds = ref([])
const selectedAmount = ref(0)
const uploadProgress = ref(0)
const uploading = ref(false)
const selectedDistribution = ref(null)
const selectedDistributionSources = ref([])

const openUrl = (url) => {
  if (url && typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

const distributionForm = ref({
  recipientName: '',
  category: '',
  amountRM: 0,
  description: '',
  evidenceUrl: '',
  date: null,
})

// All the existing functions remain the same
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewSourceDetails = (distribution) => {
  selectedDistribution.value = distribution

  if (distribution.sourcePayments && distribution.sourcePayments.length > 0) {
    selectedDistributionSources.value = distribution.sourcePayments.map((sourceId) => {
      const payment = props.availablePayments.find((p) => p.id === sourceId)
      return (
        payment || {
          userName: 'Unknown',
          amountRM: 0,
          date: new Date(),
          walletAddress: 'N/A',
          transactionId: 'N/A',
        }
      )
    })
  } else {
    selectedDistributionSources.value = []
  }
}

const editDistribution = (distribution) => {
  editingDistribution.value = distribution
  distributionForm.value = {
    recipientName: distribution.recipientName,
    category: distribution.category,
    amountRM: distribution.amountRM,
    description: distribution.description,
    evidenceUrl: distribution.evidenceUrl,
    date: distribution.date,
  }

  selectedPaymentIds.value = distribution.sourcePayments || []
  updateSelectedAmount()

  showAddDistributionModal.value = true
}

const closeDistributionModal = () => {
  showAddDistributionModal.value = false
  resetDistributionForm()
}

const resetDistributionForm = () => {
  distributionForm.value = {
    recipientName: '',
    category: '',
    amountRM: 0,
    description: '',
    evidenceUrl: '',
    date: null,
  }
  editingDistribution.value = null
  uploadProgress.value = 0
  selectedAsnafId.value = ''
  selectedAsnafDetails.value = null
  selectedPaymentIds.value = []
  selectedAmount.value = 0
}

const updateSelectedAmount = () => {
  selectedAmount.value = 0
  selectedPaymentIds.value.forEach((id) => {
    const payment = props.availablePayments.find((p) => p.id === id)
    if (payment) {
      selectedAmount.value += payment.remainingAmount || payment.amountRM
    }
  })
}

const handleAsnafSelection = () => {
  if (selectedAsnafId.value) {
    for (const category in props.groupedAsnaf) {
      const asnaf = props.groupedAsnaf[category].find((a) => a.id === selectedAsnafId.value)
      if (asnaf) {
        selectedAsnafDetails.value = asnaf
        distributionForm.value.recipientName = asnaf.name
        distributionForm.value.category = category.split(' ')[0]
        break
      }
    }
  } else {
    selectedAsnafDetails.value = null
  }
  emit('handle-asnaf-selection', selectedAsnafId.value)
}

const handleFileUpload = (event) => {
  emit(
    'handle-file-upload',
    event,
    (progress) => {
      uploadProgress.value = progress
    },
    (url) => {
      distributionForm.value.evidenceUrl = url
      uploading.value = false
    },
  )
  uploading.value = true
}

const saveDistribution = () => {
  if (uploading.value) {
    alert('Please wait for the file to finish uploading')
    return
  }

  if (selectedAmount.value < distributionForm.value.amountRM) {
    alert('Insufficient funds selected. Please select more source payments.')
    return
  }

  emit('save-distribution', {
    ...distributionForm.value,
    id: editingDistribution.value?.id,
    asnafId: selectedAsnafId.value,
    sourcePayments: selectedPaymentIds.value,
  })

  closeDistributionModal()
}
</script>
