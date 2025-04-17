<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10 border-b">
      <div class="flex items-center">
        <Button variant="ghost" class="text-gray-700 hover:bg-gray-100 mr-2 p-2" @click="goBack">
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-medium">Minta Derma</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 flex-grow">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle>Jana Pautan Permintaan</CardTitle>
          <CardDescription
            >Kongsi pautan ini untuk meminta derma daripada rakan atau keluarga.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label for="requestAmount">Jumlah Permintaan (RM)</Label>
            <Input
              id="requestAmount"
              type="number"
              v-model="requestAmount"
              placeholder="Masukkan jumlah"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="requestNote">Nota (Pilihan)</Label>
            <Textarea
              id="requestNote"
              v-model="requestNote"
              placeholder="Cth: Untuk bayar yuran sekolah"
              class="mt-1"
            />
          </div>
          <Button @click="generateLink" class="w-full" :disabled="!requestAmount || generating">
            <span v-if="generating">Menjana...</span>
            <span v-else>Jana Pautan</span>
          </Button>
        </CardContent>
      </Card>

      <div v-if="generatedLink" class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="font-medium mb-2">Pautan Permintaan Anda:</h3>
        <div class="bg-gray-100 p-3 rounded flex items-center justify-between">
          <p class="text-sm text-gray-700 break-all mr-2">{{ generatedLink }}</p>
          <Button variant="outline" size="sm" @click="copyLink"> Salin </Button>
        </div>
        <p class="text-xs text-gray-500 mt-2">Kongsi pautan ini untuk menerima derma.</p>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { toast } from 'vue-sonner'

const router = useRouter()
const requestAmount = ref('')
const requestNote = ref('')
const generating = ref(false)
const generatedLink = ref('')

const goBack = () => {
  router.go(-1)
}

const generateLink = () => {
  if (!requestAmount.value || parseFloat(requestAmount.value) <= 0) {
    toast.error('Sila masukkan jumlah permintaan yang sah.')
    return
  }

  generating.value = true
  // Simulate link generation (in real app, call backend)
  setTimeout(() => {
    const uniqueId = Date.now().toString(36)
    generatedLink.value = `${window.location.origin}/pay-request/${uniqueId}?amount=${requestAmount.value}&note=${encodeURIComponent(requestNote.value)}`
    generating.value = false
    toast.success('Pautan permintaan berjaya dijana!')
  }, 1000)
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(generatedLink.value)
    toast.success('Pautan disalin ke papan klip!')
  } catch (err) {
    toast.error('Gagal menyalin pautan.')
    console.error('Failed to copy: ', err)
  }
}
</script>
