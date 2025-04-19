/**
 * Smart Contract Service
 * This service provides functionality for interacting with cryptocurrency transactions via Luno API
 */
import * as lunoService from './lunoWalletService';

/**
 * Convert RM amount to cryptocurrency (ETH)
 * This is a simplified conversion for demonstration
 * In a real app, you would use an API to get current exchange rates
 * @param {number} rmAmount - Amount in Malaysian Ringgit
 * @returns {number} Equivalent amount in ETH
 */
export const convertRMToCrypto = (rmAmount) => {
  // Example conversion rate: 1 RM = 0.0001 ETH
  // In a real app, this would come from an API
  const conversionRate = 0.0001;
  return (rmAmount * conversionRate).toFixed(6);
}

/**
 * Get Pusat Urus Zakat Ethereum address
 * @returns {string} Ethereum address
 */
export const getPusatUrusZakatAddress = () => {
  // In a real application, this might come from configuration or be fetched from a server
  // This is a valid Ethereum address format for demonstration
  return '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
}

/**
 * Execute a zakat payment through Luno
 * @param {Object} paymentData 
 * @returns {Promise<Object>} Transaction result
 */
export const executeZakatPayment = async (paymentData) => {
  console.log('Executing zakat payment via Luno:', paymentData);
  
  try {
    // Use Luno API to send crypto
    const result = await lunoService.sendCrypto({
      currency: paymentData.currency || 'XBT',  // Default to Bitcoin
      amount: paymentData.amount.toString(),
      address: paymentData.recipientAddress || getPusatUrusZakatAddress(),
      description: `Zakat Payment - ${new Date().toISOString()}`
    });
    
    // Return transaction data 
    return {
      success: true,
      transactionId: result.id || `luno-tx-${Date.now()}`,
      from: paymentData.walletInfo?.id || 'unknown',
      to: paymentData.recipientAddress || getPusatUrusZakatAddress(),
      amount: paymentData.amount,
      currency: paymentData.currency || 'XBT',
      timestamp: new Date().toISOString(),
      status: 'pending',
      provider: 'Luno'
    };
  } catch (error) {
    console.error('Error processing Luno payment:', error);
    throw error;
  }
}

/**
 * Process crypto payment using Luno
 * @param {Object} params Transaction parameters
 * @returns {Promise<Object>} Transaction result
 */
export const processCryptoPayment = async (params) => {
  const { amount, currency, recipientAddress, walletInfo, description } = params;
  
  try {
    // Use Luno API to send cryptocurrency
    const result = await lunoService.sendCrypto({
      currency: currency || 'XBT', // Default to Bitcoin
      amount: amount.toString(),
      address: recipientAddress,
      description: description || `Payment - ${new Date().toISOString()}`
    });
    
    // Return transaction result
    const txId = result.id || `luno-tx-${Date.now()}`;
    return {
      success: true,
      id: txId,
      transactionId: txId,  // Include both for compatibility
      from: walletInfo?.id || 'unknown',
      to: recipientAddress,
      amount,
      currency: currency || 'XBT',
      timestamp: new Date().toISOString(),
      status: 'pending',
      provider: 'Luno'
    };
  } catch (error) {
    console.error('Error processing Luno payment:', error);
    throw error;
  }
}

/**
 * Get transaction details from Luno
 * @param {string} txId - Transaction ID 
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionDetails = async (txId) => {
  try {
    // Get transactions from Luno
    const transactions = await lunoService.getTransactions();
    
    // Find the specific transaction
    const transaction = transactions.find(tx => tx.id === txId);
    
    if (transaction) {
      return {
        id: transaction.id,
        timestamp: transaction.time,
        amount: transaction.amount,
        fee: transaction.fee,
        currency: transaction.currency,
        status: transaction.status,
        type: transaction.type,
        description: transaction.description || '',
        provider: 'Luno'
      };
    }
    
    // If transaction not found, return mock data
    return {
      id: txId,
      timestamp: new Date().toISOString(),
      amount: '0',
      fee: '0',
      currency: 'XBT',
      status: 'unknown',
      type: 'unknown',
      description: 'Transaction not found',
      provider: 'Luno'
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
}; 