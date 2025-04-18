<template>
  <div class="space-y-6">
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">Asnaf (Eligible Recipients) Listing</h2>
      <div class="flex flex-wrap gap-2">
        <Button @click="showAddDialog = true" variant="default">
          <PlusIcon class="h-4 w-4 mr-2" /> Add New Asnaf
        </Button>
        <Button @click="showEligibilityDialog = true" variant="secondary">
          <Bot class="h-4 w-4 mr-2" /> Assess Eligibility
        </Button>
        <Button @click="openBatchValidateDialog" variant="outline">
          <ListChecksIcon class="h-4 w-4 mr-2" /> Batch Validate All
        </Button>
      </div>
    </div>

    <!-- Add/Edit Asnaf Dialog -->
    <Dialog :open="showAddDialog || !!editAsnafData" @update:open="closeAddEditDialog">
      <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editAsnafData ? 'Edit Asnaf' : 'Add New Asnaf' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="submitAsnafForm" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <Input v-model="asnafForm.name" placeholder="Name" required />
            <Input v-model="asnafForm.ic_number" placeholder="ID Number" required />
            <Input v-model="asnafForm.contact" placeholder="Contact" required />
            <Input v-model="asnafForm.district" placeholder="District" required />
            <Input v-model="asnafForm.state" placeholder="State" required />
            <Input
              v-model.number="asnafForm.monthly_income"
              type="number"
              min="0"
              step="0.01"
              placeholder="Monthly Income (RM)"
              required
            />
            <Textarea v-model="asnafForm.needs" placeholder="Needs" rows="2" />
            <Textarea v-model="asnafForm.notes" placeholder="Notes" rows="2" />
            <Select v-model="asnafForm.status">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="closeAddEditDialog">Cancel</Button>
            <Button type="submit">{{ editAsnafData ? 'Update' : 'Add' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Assess Eligibility Dialog -->
    <Dialog :open="showEligibilityDialog" @update:open="showEligibilityDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assess Eligibility (ML)</DialogTitle>
        </DialogHeader>
        <div class="space-y-2">
          <p>This will run the ML eligibility assessment for all asnaf in the system.</p>
          <Button @click="assessEligibility" :loading="eligibilityLoading" class="w-full">
            <Bot class="h-4 w-4 mr-2" /> Run Assessment
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Batch Validate All Dialog -->
    <Dialog :open="showBatchValidateDialog" @update:open="showBatchValidateDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Validate All</DialogTitle>
        </DialogHeader>
        <div class="space-y-2">
          <p>This will validate all asnaf in the system. Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" @click="showBatchValidateDialog = false">Cancel</Button>
            <Button variant="default" @click="confirmBatchValidate">Validate All</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="!!deleteAsnafData" @update:open="closeDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Asnaf</DialogTitle>
        </DialogHeader>
        <div class="space-y-2">
          <p>
            Are you sure you want to delete
            <span class="font-semibold">{{ deleteAsnafData?.name }}</span
            >?
          </p>
          <DialogFooter>
            <Button variant="outline" @click="closeDeleteDialog">Cancel</Button>
            <Button variant="destructive" @click="confirmDeleteAsnaf">Delete</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <Card v-if="loading" class="p-6 flex justify-center items-center">
      <Spinner class="mr-2" />
      <span>Loading asnaf data...</span>
    </Card>

    <div v-else class="space-y-8">
      <div v-for="(asnafList, category) in groupedAsnaf" :key="category" class="space-y-4">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold">{{ category }}</h3>
          <Badge variant="outline">{{ asnafList.length }}</Badge>
        </div>
        <Card class="bg-gray-50">
          <CardContent>
            <Table v-if="asnafList.length > 0">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ML Assessment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="asnaf in asnafList" :key="asnaf.id">
                  <TableCell>{{ asnaf.name }}</TableCell>
                  <TableCell>{{ asnaf.ic_number }}</TableCell>
                  <TableCell>{{ asnaf.contact }}</TableCell>
                  <TableCell>{{ asnaf.district }}, {{ asnaf.state }}</TableCell>
                  <TableCell
                    >RM
                    {{ asnaf.monthly_income ? asnaf.monthly_income.toFixed(2) : '0.00' }}</TableCell
                  >
                  <TableCell>
                    <Badge
                      :variant="
                        asnaf.status === 'Active'
                          ? 'success'
                          : asnaf.status === 'Pending'
                            ? 'warning'
                            : 'secondary'
                      "
                    >
                      {{ asnaf.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      v-if="asnaf.ml_assessment"
                      :variant="asnaf.ml_assessment === 'Deserves Help' ? 'success' : 'destructive'"
                      size="lg"
                      class="w-full"
                      disabled
                    >
                      <Bot class="h-3 w-3 mr-1" />
                      {{ asnaf.ml_assessment }}
                    </Button>
                    <Button
                      v-else
                      size="lg"
                      variant="secondary"
                      @click="validateAsnafEligibility(asnaf)"
                      class="w-full"
                    >
                      <Bot class="h-3 w-3 mr-1" /> Validate
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        @click="editAsnaf(asnaf)"
                        :aria-label="`Edit ${asnaf.name}`"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        @click="deleteAsnaf(asnaf)"
                        :aria-label="`Delete ${asnaf.name}`"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div
              v-else
              class="text-center p-4 text-muted-foreground bg-white rounded border border-gray-100"
            >
              No recipients in this category
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PencilIcon, PlusIcon, Bot, ListChecksIcon } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  groupedAsnaf: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits([
  'add-new-asnaf',
  'edit-asnaf',
  'validate-asnaf-eligibility',
  'batch-validate-all-asnaf',
  'show-assess-eligibility-modal',
])
const showAddDialog = ref(false)
const showEligibilityDialog = ref(false)
const showBatchValidateDialog = ref(false)
const editAsnafData = ref(null)
const deleteAsnafData = ref(null)
const eligibilityLoading = ref(false)

const asnafForm = ref({
  name: '',
  ic_number: '',
  contact: '',
  district: '',
  state: '',
  monthly_income: 0,
  needs: '',
  notes: '',
  status: 'Active',
})

function openBatchValidateDialog() {
  showBatchValidateDialog.value = true
}
function closeAddEditDialog() {
  showAddDialog.value = false
  editAsnafData.value = null
  resetAsnafForm()
}
function closeDeleteDialog() {
  deleteAsnafData.value = null
}
function resetAsnafForm() {
  asnafForm.value = {
    name: '',
    ic_number: '',
    contact: '',
    district: '',
    state: '',
    monthly_income: 0,
    needs: '',
    notes: '',
    status: 'Active',
  }
}
function submitAsnafForm() {
  if (editAsnafData.value) {
    emit('edit-asnaf', { ...asnafForm.value, id: editAsnafData.value.id })
  } else {
    emit('add-new-asnaf', { ...asnafForm.value })
  }
  closeAddEditDialog()
}
function assessEligibility() {
  eligibilityLoading.value = true
  emit('show-assess-eligibility-modal')
  setTimeout(() => {
    eligibilityLoading.value = false
    showEligibilityDialog.value = false
  }, 1200)
}
function confirmBatchValidate() {
  emit('batch-validate-all-asnaf')
  showBatchValidateDialog.value = false
}
function validateAsnafEligibility(asnaf) {
  emit('validate-asnaf-eligibility', asnaf)
}
function editAsnaf(asnaf) {
  editAsnafData.value = asnaf
  Object.assign(asnafForm.value, asnaf)
  showAddDialog.value = false
}
function deleteAsnaf(asnaf) {
  deleteAsnafData.value = asnaf
}
function confirmDeleteAsnaf() {
  emit('delete-asnaf', deleteAsnafData.value)
  closeDeleteDialog()
}

// Simple spinner for loading
const Spinner = {
  name: 'Spinner',
  template: `<div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full"></div>`,
}
</script>
