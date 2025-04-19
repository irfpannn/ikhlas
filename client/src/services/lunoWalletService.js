/**
 * Luno Wallet Service
 * This service provides functionality for interacting with Luno Wallet API
 */

import axios from 'axios';
import CryptoJS from 'crypto-js';

// Luno API credentials
const API_KEY_ID = 'jgwhe6j4fbpk9';
const API_KEY_SECRET = '9SVa3lPirgR9-k3joirqukEdD7d0ZZQv0R23IdCvRYc';

// Choose the appropriate API URL based on environment
// In development, use the Vite proxy to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '/luno-api'  // This will be proxied by Vite
  : 'https://api.luno.com/api/1';

console.log(`Using Luno API URL: ${API_BASE_URL} (isDev: ${isDevelopment})`);

// Create axios instance with default configuration
const lunoApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

/**
 * Create the authorization header for Luno API requests
 * @returns {string} Authorization header value
 */
const createAuthHeader = () => {
  const authString = `${API_KEY_ID}:${API_KEY_SECRET}`;
  const base64Auth = btoa(authString);
  return `Basic ${base64Auth}`;
};

/**
 * Get account information from Luno
 * @returns {Promise<Object>} Account information
 */
export const getAccountInfo = async () => {
  try {
    const response = await lunoApi.get('/accounts', {
      headers: {
        'Authorization': createAuthHeader()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Luno account info:', error);
    
    // In development, return mock data for testing
    if (isDevelopment) {
      console.log('Returning mock account data for development');
      return {
        accounts: [
          {
            id: 'mock-account-id',
            name: 'Mock Luno Account',
            currency: 'XBT',
            balance: '0.01234567'
          }
        ]
      };
    }
    
    throw error;
  }
};

/**
 * Get wallet balances from Luno
 * @returns {Promise<Array>} List of balances for different currencies
 */
export const getBalances = async () => {
  try {
    const response = await lunoApi.get('/balance', {
      headers: {
        'Authorization': createAuthHeader()
      }
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error fetching Luno balances:', error);
    
    // In development, return mock data for testing
    if (isDevelopment) {
      console.log('Returning mock balance data for development');
      return [
        {
          asset: 'XBT',
          balance: '0.01234567',
          reserved: '0',
          unconfirmed: '0'
        },
        {
          asset: 'ETH',
          balance: '0.5432100',
          reserved: '0',
          unconfirmed: '0'
        }
      ];
    }
    
    throw error;
  }
};

/**
 * Get a single address for receiving cryptocurrency
 * @param {string} asset - The cryptocurrency (BTC, ETH, etc.)
 * @returns {Promise<Object>} Address information
 */
export const getReceiveAddress = async (asset) => {
  try {
    const response = await lunoApi.get(`/receive/${asset}`, {
      headers: {
        'Authorization': createAuthHeader()
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${asset} receive address:`, error);
    
    // In development, return mock data for testing
    if (isDevelopment) {
      return {
        asset,
        address: '0xmock1234567890abcdef1234567890abcdef',
        total_received: '0',
        total_unconfirmed: '0'
      };
    }
    
    throw error;
  }
};

/**
 * Send cryptocurrency from Luno wallet
 * @param {Object} params - Transaction parameters
 * @param {string} params.currency - The cryptocurrency to send (BTC, ETH, etc.)
 * @param {string} params.amount - Amount to send
 * @param {string} params.address - Recipient address
 * @param {string} params.description - Optional transaction description
 * @returns {Promise<Object>} Transaction result
 */
export const sendCrypto = async ({ currency, amount, address, description = '' }) => {
  try {
    const response = await lunoApi.post('/send', 
      {
        currency,
        amount,
        address,
        description
      },
      {
        headers: {
          'Authorization': createAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending crypto from Luno:', error);
    
    // In development, return mock data for testing
    if (isDevelopment) {
      return {
        id: `mock-tx-${Date.now()}`,
        currency,
        amount,
        address,
        status: 'PENDING'
      };
    }
    
    throw error;
  }
};

/**
 * Get transaction history 
 * @returns {Promise<Array>} List of transactions
 */
export const getTransactions = async () => {
  try {
    const response = await lunoApi.get('/transactions', {
      headers: {
        'Authorization': createAuthHeader()
      }
    });
    return response.data.transactions;
  } catch (error) {
    console.error('Error fetching Luno transactions:', error);
    
    // In development, return mock data for testing
    if (isDevelopment) {
      return [
        {
          id: 'mock-tx-1',
          timestamp: new Date().toISOString(),
          amount: '0.01',
          currency: 'XBT',
          description: 'Mock transaction',
          status: 'COMPLETED'
        }
      ];
    }
    
    throw error;
  }
};

/**
 * Check if Luno API is accessible
 * @returns {Promise<boolean>} True if API is accessible
 */
export const isLunoApiAccessible = async () => {
  if (isDevelopment) {
    // For faster development, skip actual API check and always return true with mock data
    console.log('Development mode: Using mock Luno data without API check');
    return true;
  }
  
  try {
    await getBalances();
    return true;
  } catch (error) {
    console.error('Luno API is not accessible:', error);
    // For development, always return true to enable testing
    if (isDevelopment) {
      console.log('Using mock data since Luno API is not accessible');
      return true;
    }
    return false;
  }
}; 