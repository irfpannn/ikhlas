import { db } from './firebaseService' // Assuming firebaseService exports initialized db
import { collection, getDocs, doc, getDoc, addDoc, query, where, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

const donationsCollectionRef = collection(db, 'donations')

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
    const docRef = doc(db, 'donations', id) // Use 'donations' collection
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

/**
 * Save donation transaction to Firestore
 * @param {Object} donationData - Donation transaction data
 * @param {string} donationData.senderId - ID of the donor
 * @param {string} donationData.senderName - Name of the donor
 * @param {string} donationData.recipientId - ID of the recipient
 * @param {string} donationData.recipientName - Name of the recipient
 * @param {number} donationData.amount - Donation amount
 * @param {string} donationData.paymentMethod - Payment method used
 * @param {string} donationData.category - Donation category
 * @param {string} donationData.notes - Optional notes about the donation
 * @returns {Promise<string>} - ID of the created donation document
 */
export async function saveDonationTransaction(transactionData) {
  try {
    const db = getFirestore();
    const transactionsRef = collection(db, "donations");
    
    // Ensure timestamp is a Firestore timestamp
    if (!transactionData.timestamp) {
      transactionData.timestamp = serverTimestamp();
    }
    
    // Add the transaction to Firestore
    const docRef = await addDoc(transactionsRef, transactionData);
    console.log("Transaction saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
}

/**
 * Get donation transactions for a specific user
 * @param {string} userId - User ID to fetch donations for
 * @param {string} role - 'donor' or 'recipient' to determine which transactions to fetch
 * @returns {Promise<Array>} - Array of donation transactions
 */
export const getUserDonationTransactions = async (userId, role = 'donor') => {
  try {
    const fieldToQuery = role === 'donor' ? 'senderId' : 'recipientId';
    
    const q = query(
      collection(db, 'donations'),
      where(fieldToQuery, '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching donation transactions:', error);
    throw error;
  }
};

/**
 * Get all donation transactions (for admin)
 * @returns {Promise<Array>} - Array of all donation transactions
 */
export const getAllDonationTransactions = async () => {
  try {
    const q = query(
      collection(db, 'donations'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching all donation transactions:', error);
    throw error;
  }
};
