<template>
  <div class="admin-login-container">
    <div class="login-card">
      <h1>Admin Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter admin email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter password"
          />
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { initializeApp } from 'firebase/app';

export default {
  name: 'AdminLoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const loading = ref(false);
    const router = useRouter();
    
    // Ensure Firebase is initialized
    onMounted(() => {
      try {
        // Check if Firebase is already initialized
        getAuth();
      } catch (error) {
        console.error('Firebase not initialized:', error);
        errorMessage.value = 'Error initializing authentication. Please try again later.';
      }
    });
    
    const handleLogin = async () => {
      loading.value = true;
      errorMessage.value = '';
      
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        
        // Check if user has admin role (you'll need to implement this check)
        // For now, we'll redirect to the admin dashboard
        router.push('/admin/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = 'Invalid email or password. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      errorMessage,
      loading,
      handleLogin
    };
  }
}
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
