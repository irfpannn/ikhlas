// This service handles fetching and saving transaction data.
// Currently uses localStorage, but can be updated later to use Firebase Firestore or an API.

const HISTORY_STORAGE_KEY = 'transactionHistory'
const LATEST_TX_STORAGE_KEY = 'zakatTransaction'

// Function to get transaction history
export const getTransactionHistory = async () => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    // Simulate async operation if needed in the future
    // await new Promise(resolve => setTimeout(resolve, 100));
    return history
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}

// Function to add a new transaction
export const addTransaction = async (transaction) => {
  try {
    const history = await getTransactionHistory()
    history.unshift(transaction) // Add to the beginning
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    localStorage.setItem(LATEST_TX_STORAGE_KEY, JSON.stringify(transaction)) // Also save as the latest
    return transaction
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to get the latest transaction (optional, based on existing logic)
export const getLatestTransaction = async () => {
  try {
    const latest = JSON.parse(localStorage.getItem(LATEST_TX_STORAGE_KEY) || 'null')
    return latest
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
