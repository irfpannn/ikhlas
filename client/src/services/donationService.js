import { db } from './firebaseService' // Assuming firebaseService exports initialized db
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

const donationsCollectionRef = collection(db, 'donation')

/**
 * Fetches all donations from Firestore.
 * @returns {Promise<Array>} A promise that resolves with an array of donation objects.
 */
export const getAllDonations = async () => {
  try {
    const querySnapshot = await getDocs(donationsCollectionRef)
    const donations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return donations
  } catch (error) {
    console.error('Error fetching donations:', error)
    throw new Error('Gagal memuatkan data derma.') // Updated error message
  }
}

/**
 * Fetches a single donation by its ID from Firestore.
 * @param {string} id The ID of the donation document.
 * @returns {Promise<Object|null>} A promise that resolves with the donation object or null if not found.
 */
export const getDonationById = async (id) => {
  if (!id) {
    console.error('Error: Donation ID is required.')
    throw new Error('ID Derma diperlukan.')
  }
  try {
    const docRef = doc(db, 'donation', id) // Use 'donation' collection
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      console.log('No such donation document!')
      return null
    }
  } catch (error) {
    console.error('Error fetching donation by ID:', error)
    throw new Error('Gagal memuatkan data derma.') // Updated error message
  }
}
