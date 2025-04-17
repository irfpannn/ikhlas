<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-gray-100">
    <form
      @submit.prevent="handleSignup"
      class="bg-white p-6 rounded shadow w-full max-w-sm space-y-4"
    >
      <h2 class="text-xl font-bold">Sign Up</h2>
      <input v-model="email" type="email" placeholder="Email" required class="input" />
      <input v-model="password" type="password" placeholder="Password" required class="input" />
      <button type="submit" class="btn w-full">Sign Up</button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p class="text-sm">Already have an account? <router-link to="/login">Login</router-link></p>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '@/services/authService'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleSignup = async () => {
  error.value = ''
  try {
    await signUp(email.value, password.value)
    router.push('/profile-complete')
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
