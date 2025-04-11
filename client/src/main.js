import '@/assets/styles.css'

import { createApp } from 'vue'

import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)

app.mount('#app')
