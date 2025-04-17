import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { onAuthStateChanged } from 'firebase/auth' // Import onAuthStateChanged
import { auth } from './services/firebaseService' // Import Firebase auth instance

let app = null // Keep app instance reference outside the callback

// Wait for Firebase to initialize auth state before mounting the app
onAuthStateChanged(auth, (user) => {
  // Initialize the app only once
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
  }

  // The authStore's own onAuthChange listener will handle updating the store state.
  // This setup primarily ensures the app doesn't mount until the initial check is done.
})
