// This service handles fetching and saving transaction data using Firebase Firestore
import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db, auth } from '@/services/firebaseService'

const TRANSACTIONS_COLLECTION = 'donations' // Collection name in Firestore

// Function to get transaction history for the current user
export const getTransactionHistory = async () => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('No authenticated user found')
      return []
    }

    const userId = currentUser.uid

    // Query Firestore for transactions where senderId matches the current user's ID
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    const q = query(transactionsRef, where('senderId', '==', userId), orderBy('timestamp', 'desc'))

    const querySnapshot = await getDocs(q)
    const transactions = []

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return transactions
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}

// Function to add a new transaction
export const addTransaction = async (transaction) => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      throw new Error('No authenticated user found')
    }

    // Add user ID to the transaction data
    transaction.senderId = currentUser.uid

    // Add timestamp if not present
    if (!transaction.timestamp) {
      transaction.timestamp = new Date().toISOString()
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transaction)

    // Return the transaction with the Firestore document ID
    return {
      id: docRef.id,
      ...transaction,
    }
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to get the latest transaction
export const getLatestTransaction = async () => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('No authenticated user found')
      return null
    }

    const userId = currentUser.uid

    // Query Firestore for the most recent transaction
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    const q = query(
      transactionsRef,
      where('senderId', '==', userId),
      orderBy('timestamp', 'desc'),
      // limit(1) - commented out as 'limit' is not imported, but you may uncomment and import it
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    // Return the first (most recent) document
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error('Error fetching latest transaction:', error)
    return null
  }
}

// Example of how you might fetch from Firestore later:
/*
import { db } from './firebaseService';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';

export const getTransactionHistoryFirestore = async (userId) => {
  // Assuming transactions are stored per user
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsCol, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTransactionFirestore = async (userId, transaction) => {
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  const docRef = await addDoc(transactionsCol, transaction);
  return { id: docRef.id, ...transaction };
};
*/
