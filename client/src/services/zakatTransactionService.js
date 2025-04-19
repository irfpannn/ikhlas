import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db, auth } from '@/services/firebaseService'

const ZAKAT_PAYMENTS_COLLECTION = 'transactions' // Collection name in Firestore

// Function to get zakat payment history for the current user
export const getZakatPaymentHistory = async () => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('No authenticated user found for fetching zakat history')
      return []
    }

    const userId = currentUser.uid

    // Query Firestore for transactions where senderId matches and type is 'zakat'
    const transactionsRef = collection(db, ZAKAT_PAYMENTS_COLLECTION)
    const q = query(
      transactionsRef,
      where('senderId', '==', userId),
      where('type', '==', 'zakat'), // Filter by type 'zakat'
      orderBy('timestamp', 'desc'), // Order by the 'timestamp' field
    )

    const querySnapshot = await getDocs(q)
    const zakatPayments = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Map Firestore data to the new format
      const formattedData = {
        id: doc.id,
        amount: data.amount || 0,
        category: data.category || '',
        currency: data.currency || 'RM', // Default currency if not present
        notes: data.notes || '',
        paymentMethod: data.paymentMethod || '',
        recipientId: data.recipientId || '',
        recipientName: data.recipientName || '',
        senderId: data.senderId,
        senderName: data.senderName || '',
        timestamp: data.timestamp, // Use the timestamp field directly
        type: data.type, // Should be 'zakat' or potentially other types like 'crypto-donation'
        status: data.status || 'completed', // Keep status mapping
        transactionHash: data.transactionHash || null, // Add the transactionHash field
      }
      zakatPayments.push(formattedData)
    })

    console.log(`Fetched ${zakatPayments.length} zakat transactions for user ${userId}`)
    return zakatPayments
  } catch (error) {
    console.error('Error fetching zakat payment history:', error)
    return []
  }
}

// Function to get user's full name from Firestore
const getUserFullName = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      // Get the user_fullname field from the user document
      const userData = userDoc.data()
      return userData.user_fullname || null
    }
    return null
  } catch (error) {
    console.error('Error fetching user full name:', error)
    return null
  }
}

// Function to add a new zakat payment record
export const addZakatPayment = async (paymentData) => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      throw new Error('No authenticated user found for adding zakat payment')
    }

    // Generate a mock transaction hash
    const generateMockTransactionHash = () => {
      // Create a random number string (using current timestamp + random number for uniqueness)
      const randomNum = Date.now() + Math.floor(Math.random() * 1000000)
      return `mock-tx-${randomNum}`
    }

    // Fetch the user's full name from Firestore
    const userFullName = await getUserFullName(currentUser.uid)

    // Prepare data according to the new format
    const zakatPaymentData = {
      amount: paymentData.amount || 0,
      category: paymentData.category || 'Zakat Payment', // Default category
      currency: paymentData.currency || 'RM',
      notes: paymentData.notes || '',
      paymentMethod: paymentData.paymentMethod || 'unknown',
      recipientId: paymentData.recipientId || 'zakat-authority', // Default recipient
      recipientName: paymentData.recipientName || 'Zakat Authority',
      senderId: currentUser.uid,
      senderName: userFullName || currentUser.displayName || 'Anonymous User', // Prioritize user_fullname from Firestore
      timestamp: serverTimestamp(), // Use Firestore server timestamp for accuracy
      type: 'zakat', // Explicitly set type
      status: paymentData.status || 'completed', // Default status
      transactionHash: paymentData.transactionHash || generateMockTransactionHash(), // Add transaction hash
    }

    // Add to Firestore 'transactions' collection
    const docRef = await addDoc(collection(db, ZAKAT_PAYMENTS_COLLECTION), zakatPaymentData)
    console.log(`Added zakat transaction with ID: ${docRef.id}`)

    // Return the added data including the ID and server-generated timestamp (once fetched)
    // Note: The timestamp will be null initially until the server confirms it.
    // For immediate use, you might want to return a client-side timestamp or fetch the doc again.
    return {
      id: docRef.id,
      ...zakatPaymentData,
      timestamp: new Date(), // Return client time for immediate feedback, actual is serverTimestamp
    }
  } catch (error) {
    console.error('Error adding zakat payment:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to get the latest zakat payment
export const getLatestZakatPayment = async () => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('No authenticated user found for fetching latest zakat payment')
      return null
    }

    const userId = currentUser.uid

    // Query Firestore for the most recent transaction of type 'zakat'
    const transactionsRef = collection(db, ZAKAT_PAYMENTS_COLLECTION)
    const q = query(
      transactionsRef,
      where('senderId', '==', userId),
      where('type', '==', 'zakat'), // Filter by type 'zakat'
      orderBy('timestamp', 'desc'), // Order by the 'timestamp' field
      limit(1),
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log(`No zakat transactions found for user ${userId}`)
      return null
    }

    // Return the first (most recent) document, formatted
    const doc = querySnapshot.docs[0]
    const data = doc.data()

    const latestPayment = {
      id: doc.id,
      amount: data.amount || 0,
      category: data.category || '',
      currency: data.currency || 'RM',
      notes: data.notes || '',
      paymentMethod: data.paymentMethod || '',
      recipientId: data.recipientId || '',
      recipientName: data.recipientName || '',
      senderId: data.senderId,
      senderName: data.senderName || '',
      timestamp: data.timestamp, // Use the timestamp field directly
      type: data.type,
      status: data.status || 'completed',
      transactionHash: data.transactionHash || null, // Add the transactionHash field
    }
    console.log(`Fetched latest zakat transaction for user ${userId}:`, latestPayment)
    return latestPayment
  } catch (error) {
    console.error('Error fetching latest zakat payment:', error)
    return null
  }
}
