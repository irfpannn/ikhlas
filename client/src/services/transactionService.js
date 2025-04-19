import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db } from './firebaseService'

const TRANSACTIONS_COLLECTION = 'transactions'

/**
 * Fetch all transactions from Firestore
 * @returns {Promise<Array>} Array of transactions
 */
export const getAllTransactions = async () => {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    const q = query(transactionsRef, orderBy('timestamp', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const transactions = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        amount: data.amount || 0,
        category: data.category || '',
        currency: data.currency || 'RM',
        notes: data.notes || '',
        paymentMethod: data.paymentMethod || '',
        recipientId: data.recipientId || '',
        recipientName: data.recipientName || '',
        senderId: data.senderId || '',
        senderName: data.senderName || '',
        status: data.status || '',
        timestamp: data.timestamp || '',
        transactionHash: data.transactionHash || '',
        type: data.type || '',
        zakatType: data.zakatType || ''
      })
    })
    
    return transactions
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}

/**
 * Fetch transactions by sender ID
 * @param {string} senderId - ID of the sender
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionsBySender = async (senderId) => {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    const q = query(
      transactionsRef,
      where('senderId', '==', senderId),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const transactions = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        amount: data.amount || 0,
        category: data.category || '',
        currency: data.currency || 'RM',
        notes: data.notes || '',
        paymentMethod: data.paymentMethod || '',
        recipientId: data.recipientId || '',
        recipientName: data.recipientName || '',
        senderId: data.senderId || '',
        senderName: data.senderName || '',
        status: data.status || '',
        timestamp: data.timestamp || '',
        transactionHash: data.transactionHash || '',
        type: data.type || '',
        zakatType: data.zakatType || ''
      })
    })
    
    return transactions
  } catch (error) {
    console.error('Error fetching transactions by sender:', error)
    throw error
  }
}

/**
 * Add a new transaction
 * @param {Object} transactionData - Transaction data to add
 * @returns {Promise<string>} ID of the created transaction
 */
export const addTransaction = async (transactionData) => {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    
    // Ensure the data structure matches exactly what we need
    const transactionToAdd = {
      amount: Number(transactionData.amount) || 0,
      category: transactionData.category || '',
      currency: transactionData.currency || 'RM',
      notes: transactionData.notes || '',
      paymentMethod: transactionData.paymentMethod || '',
      recipientId: transactionData.recipientId || '',
      recipientName: transactionData.recipientName || '',
      senderId: transactionData.senderId || '',
      senderName: transactionData.senderName || '',
      status: transactionData.status || '',
      timestamp: transactionData.timestamp || new Date().toISOString(),
      transactionHash: transactionData.transactionHash || '',
      type: transactionData.type || '',
      zakatType: transactionData.zakatType || ''
    }
    
    const docRef = await addDoc(transactionsRef, transactionToAdd)
    return docRef.id
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
} 