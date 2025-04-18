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

// Check if the current user is an admin
export const checkIsAdmin = async (userId) => {
  if (!userId) return false

  try {
    const db = getFirestore()
    const userDoc = await getDoc(doc(db, 'users', userId))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.isAdmin === true
    }

    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
