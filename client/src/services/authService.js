// Firebase Auth Service
import { auth } from './firebaseService'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const logout = () => signOut(auth)
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb)
export const getCurrentUser = () => auth.currentUser

// Check if the user has an admin role based on their UID
export const checkAdminRole = async (userId) => {
  console.log(`Checking admin role for userId: ${userId}`)
  if (!userId) {
    console.log('checkAdminRole: No userId provided.')
    return false
  }

  try {
    const db = getFirestore()
    const userDocRef = doc(db, 'users', userId)
    console.log(`checkAdminRole: Fetching document from path: users/${userId}`)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      console.log(`checkAdminRole: User document found for ${userId}. Data:`, userData)
      const userRole = userData.user_role
      console.log(`checkAdminRole: User role found: '${userRole}'`) // Log the retrieved role
      const isAdmin = userRole === 'admin'
      console.log(`checkAdminRole: Is admin? ${isAdmin}`)
      return isAdmin // Return true only if role is exactly 'admin'
    } else {
      console.log(`checkAdminRole: User document not found for UID: ${userId}`)
      return false
    }
  } catch (error) {
    console.error(`checkAdminRole: Error checking admin status for ${userId}:`, error)
    return false
  }
}

// Get user role after login
export const getUserRole = async (userId) => {
  if (!userId) return null

  try {
    const db = getFirestore()
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      return userData.user_role || 'user' // Default to 'user' if user_role is not set
    }
    console.log(`User document not found for UID: ${userId}, defaulting role to 'user'`)
    return 'user' // Default role if document doesn't exist
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null // Indicate error
  }
}

// Deprecated: checkAdminByEmail - Use checkAdminRole(userId) instead
// export const checkAdminByEmail = async (userId) => { ... }
