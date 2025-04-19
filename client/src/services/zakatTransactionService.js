import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db, auth } from '@/services/firebaseService'

const ZAKAT_PAYMENTS_COLLECTION = 'zakatPayments' // Collection name in Firestore

// Function to get zakat payment history for the current user
export const getZakatPaymentHistory = async () => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.warn('No authenticated user found')
      return []
    }

    const userId = currentUser.uid

    // Query Firestore for zakat payments where userId matches the current user's ID
    const zakatPaymentsRef = collection(db, ZAKAT_PAYMENTS_COLLECTION)
    const q = query(zakatPaymentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const zakatPayments = []

    querySnapshot.forEach((doc) => {
      // Convert Firestore timestamps to ISO strings for consistent handling
      const data = doc.data()
      const formattedData = {
        ...data,
        id: doc.id,
        // Format timestamps for consistent handling with other transaction data
        timestamp: data.createdAt || data.date,
        // Add default fields to match donation data structure
        type: 'zakat-payment',
        currency: data.cryptoType || 'RM',
        // For RM transactions, use amountRM. For crypto, use amountCrypto.
        amount: data.cryptoType ? data.amountCrypto || 0 : data.amountRM || 0,
        status: data.status || 'completed',
      }

      zakatPayments.push(formattedData)
    })

    return zakatPayments
  } catch (error) {
    console.error('Error fetching zakat payment history:', error)
    return []
  }
}

// Function to add a new zakat payment record
export const addZakatPayment = async (paymentData) => {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      throw new Error('No authenticated user found')
    }

    // Add user info to the payment data
    const zakatPaymentData = {
      ...paymentData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: paymentData.status || 'Pending',
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, ZAKAT_PAYMENTS_COLLECTION), zakatPaymentData)

    // Return the payment with the Firestore document ID
    return {
      id: docRef.id,
      ...zakatPaymentData,
      // Format for consistent handling with other transaction data
      timestamp: zakatPaymentData.createdAt,
      type: 'zakat-payment',
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
      console.warn('No authenticated user found')
      return null
    }

    const userId = currentUser.uid

    // Query Firestore for the most recent zakat payment
    const zakatPaymentsRef = collection(db, ZAKAT_PAYMENTS_COLLECTION)
    const q = query(
      zakatPaymentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1),
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    // Return the first (most recent) document
    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      id: doc.id,
      ...data,
      // Format for consistent handling with other transaction data
      timestamp: data.createdAt || data.date,
      type: 'zakat-payment',
      currency: data.cryptoType || 'RM',
      // For RM transactions, use amountRM. For crypto, use amountCrypto.
      amount: data.cryptoType ? data.amountCrypto || 0 : data.amountRM || 0,
      status: data.status || 'completed',
    }
  } catch (error) {
    console.error('Error fetching latest zakat payment:', error)
    return null
  }
}
