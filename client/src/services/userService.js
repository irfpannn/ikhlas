// Firestore User Service
import { db } from './firebaseService'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data)
}

export const getUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid))
  return docSnap.exists() ? docSnap.data() : null
}

export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, data)
}
