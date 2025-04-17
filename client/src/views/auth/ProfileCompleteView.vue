<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-gray-100">
    <form
      @submit.prevent="handleComplete"
      class="bg-white p-6 rounded shadow w-full max-w-sm space-y-4"
    >
      <h2 class="text-xl font-bold">Complete Your Profile</h2>
      <input v-model="fullname" type="text" placeholder="Full Name" required class="input" />
      <input v-model="occupation" type="text" placeholder="Occupation" required class="input" />
      <input v-model="phone" type="tel" placeholder="Phone" required class="input" />
      <input v-model="salary" type="number" placeholder="Salary" required class="input" />
      <button type="submit" class="btn w-full">Save</button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createUserProfile } from '@/services/userService'

const fullname = ref('')
const occupation = ref('')
const phone = ref('')
const salary = ref('')
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleComplete = async () => {
  error.value = ''
  try {
    const user = auth.user
    if (!user) throw new Error('Not authenticated')
    await createUserProfile(user.uid, {
      user_address: '',
      user_email: user.email,
      user_fullname: fullname.value,
      user_occupation: occupation.value,
      user_phone: phone.value,
      user_salary: salary.value,
    })
    await auth.fetchProfile()
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>
<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}
.btn {
  background: #75a868;
  color: #fff;
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
