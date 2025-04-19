<template>
  <div class="space-y-6">
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">Asnaf (Eligible Recipients) Listing</h2>
      <div class="flex flex-wrap gap-2">
        <Button @click="validateAllAsnaf" variant="outline" :disabled="validating">
          <Spinner v-if="validating" class="mr-2" />
          {{ validating ? 'Validating...' : 'Validate All' }}
        </Button>
        <Button @click="showAddDialog = true" variant="default">
          <PlusIcon class="h-4 w-4 mr-2" /> Add New Asnaf
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
                    <div class="flex items-center gap-2">
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
                      <Badge
                        v-if="validationResults[asnaf.id]"
                        :variant="validationResults[asnaf.id].status === 'Eligible' ? 'success' : 'destructive'"
                      >
                        {{ validationResults[asnaf.id].status }}
                        ({{ (validationResults[asnaf.id].confidence * 100).toFixed(1) }}%)
                      </Badge>
                    </div>
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
import { ref, onMounted } from 'vue'
import { PencilIcon, PlusIcon } from 'lucide-vue-next'
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
import * as tf from '@tensorflow/tfjs'

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
  'delete-asnaf',
])
const showAddDialog = ref(false)
const editAsnafData = ref(null)
const deleteAsnafData = ref(null)

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

// Add validation function
async function validateAsnafEligibility(asnaf) {
  try {
    // Prepare the data for the API
    const requestData = {
      monthly_income: parseFloat(asnaf.monthly_income) || 0,
      family_members: parseInt(asnaf.family_members) || 1,
      has_stable_housing: asnaf.has_stable_housing ? 1 : 0,
      access_to_clean_water: asnaf.access_to_clean_water ? 1 : 0,
      access_to_electricity: asnaf.access_to_electricity ? 1 : 0,
      has_significant_health_issues: asnaf.has_significant_health_issues ? 1 : 0
    }

    // Call the API endpoint
    const response = await fetch('http://localhost:5001/api/assess-eligibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error('Failed to assess eligibility')
    }

    const result = await response.json()
    
    return {
      status: result.result.prediction === "Deserves Help" ? 'Eligible' : 'Not Eligible',
      confidence: parseFloat(result.result.probability_deserves_help) / 100,
      details: {
        monthlyIncome: requestData.monthly_income,
        familyMembers: requestData.family_members,
        criteria: result.result.prediction
      }
    }
  } catch (error) {
    console.error('Error validating asnaf eligibility:', error)
    return {
      status: 'Error',
      confidence: 0,
      details: {
        error: error.message
      }
    }
  }
}

// Add validation button and status display
const validating = ref(false)
const validationResults = ref({})

async function validateAllAsnaf() {
  validating.value = true
  validationResults.value = {}
  
  for (const [category, asnafList] of Object.entries(props.groupedAsnaf)) {
    for (const asnaf of asnafList) {
      const result = await validateAsnafEligibility(asnaf)
      validationResults.value[asnaf.id] = result
    }
  }
  
  validating.value = false
}
</script>
