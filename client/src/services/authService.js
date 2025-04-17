// Firebase Auth Service
import { auth } from './firebaseService'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const logout = () => signOut(auth)
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb)
export const getCurrentUser = () => auth.currentUser
