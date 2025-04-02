'use server'

import axios, { AxiosInstance } from 'axios';

// Tipe data untuk konfigurasi Kill Bill
interface KillBillConfig {
  baseURL: string;
  auth: {
    username: string;
    password: string;
  };
  headers: {
    'X-Killbill-ApiKey': string;
    'X-Killbill-ApiSecret': string;
    'Content-Type': string;
  };
}

// Tipe data untuk akun
export interface AccountData {
  name: string;
  email: string;
  phone?: string;
  currency: string;
  externalKey?: string;
  address1?: string;
  address2?: string;
  company?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  locale?: string;
}

// Tipe data untuk respons akun
export interface AccountResponse {
  accountId: string;
  name: string;
  email: string;
  externalKey: string;
  currency: string;
}

// Tipe data untuk langganan
export interface SubscriptionData {
  planName: string;
  productCategory: string;
  billingPeriod: string;
  priceList: string;
  startDate?: string;
}

// Tipe data untuk respons langganan
export interface SubscriptionResponse {
  subscriptionId: string;
  accountId: string;
  bundleId: string;
  productName: string;
  planName: string;
  state: string;

}

// Tipe data untuk invoice
export interface InvoiceResponse {
  invoiceId: string;
  accountId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceDate: string;
  targetDate: string;

}

// Tipe data untuk pembayaran
export interface PaymentData {
  paymentMethodId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  transactionExternalKey?: string;
  transactionType?: string;
}

// Tipe data untuk respons pembayaran
export interface PaymentResponse {
  paymentId: string;
  accountId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
}

// Tipe data untuk metode pembayaran
export interface PaymentMethodData {
  pluginName: string;
  pluginInfo?: unknown;
}

// Tipe data untuk respons metode pembayaran
export interface PaymentMethodResponse {
  paymentMethodId: string;
  accountId: string;
  isDefault: boolean;
  pluginName: string;

}

// Konfigurasi dasar Kill Bill
const killbillConfig: KillBillConfig = {
  baseURL: process.env.KILLBILL_URL || '',
  auth: {
    username: process.env.KILLBILL_USERNAME || '',
    password: process.env.KILLBILL_PASSWORD || ''
  },
  headers: {
    'X-Killbill-ApiKey': process.env.KILLBILL_API_KEY || '',
    'X-Killbill-ApiSecret': process.env.KILLBILL_API_SECRET || '',
    'Content-Type': 'application/json'
  }
};

// Inisialisasi klien axios untuk Kill Bill
export const killbillClient: AxiosInstance = axios.create(killbillConfig);

// Generate headers untuk setiap request
const getCommonHeaders = () => {
  return {
    'X-Killbill-CreatedBy': 'nextjs-app',
    'X-Killbill-Reason': 'Payment integration POC',
    'X-Killbill-Comment': 'Next.js Midtrans integration',
  };
};

/**
 * Membuat akun baru di Kill Bill
 * @param accountData - Data akun yang akan dibuat
 * @returns Data akun yang telah dibuat
 */
export async function createAccount(accountData: AccountData): Promise<AccountResponse> {
  try {
    const response = await killbillClient.post('/1.0/kb/accounts', accountData, {
      headers: {
        ...getCommonHeaders(),
        'X-Killbill-UseGlobalDefault': 'true'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

/**
 * Mendapatkan akun berdasarkan ID
 * @param accountId - ID akun yang akan diambil
 * @returns Data akun
 */
export async function getAccount(accountId: string): Promise<AccountResponse> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

/**
 * Mencari akun berdasarkan email
 * @param email - Email akun yang akan dicari
 * @returns Data akun jika ditemukan
 */
export async function searchAccountByEmail(email: string): Promise<AccountResponse[]> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/search/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error searching account by email:', error);
    throw error;
  }
}

/**
 * Membuat langganan baru
 * @param accountId - ID akun
 * @param subscriptionData - Data langganan yang akan dibuat
 * @returns Data langganan yang telah dibuat
 */
export async function createSubscription(
  accountId: string, 
  subscriptionData: SubscriptionData
): Promise<SubscriptionResponse> {
  try {
    const response = await killbillClient.post('/1.0/kb/subscriptions', 
      {
        accountId,
        planName: subscriptionData.planName,
        productCategory: subscriptionData.productCategory,
        billingPeriod: subscriptionData.billingPeriod,
        priceList: subscriptionData.priceList,
        startDate: subscriptionData.startDate
      }, 
      {
        headers: getCommonHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Mendapatkan langganan berdasarkan ID
 * @param subscriptionId - ID langganan yang akan diambil
 * @returns Data langganan
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
  try {
    const response = await killbillClient.get(`/1.0/kb/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Mendapatkan semua langganan untuk akun tertentu
 * @param accountId - ID akun
 * @returns Array langganan
 */
export async function getSubscriptionsByAccount(accountId: string): Promise<SubscriptionResponse[]> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/${accountId}/subscriptions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions for account:', error);
    throw error;
  }
}

/**
 * Membuat invoice untuk akun
 * @param accountId - ID akun
 * @returns Data invoice yang telah dibuat
 */
export async function createInvoice(accountId: string): Promise<InvoiceResponse> {
  try {
    const response = await killbillClient.post(
      `/1.0/kb/accounts/${accountId}/invoices`, 
      {}, 
      {
        headers: getCommonHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

/**
 * Mendapatkan invoice berdasarkan ID
 * @param invoiceId - ID invoice yang akan diambil
 * @returns Data invoice
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  try {
    const response = await killbillClient.get(`/1.0/kb/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

/**
 * Mendapatkan semua invoice untuk akun tertentu
 * @param accountId - ID akun
 * @returns Array invoice
 */
export async function getInvoicesByAccount(accountId: string): Promise<InvoiceResponse[]> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/${accountId}/invoices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices for account:', error);
    throw error;
  }
}

/**
 * Menambahkan metode pembayaran ke akun
 * @param accountId - ID akun
 * @param paymentMethodData - Data metode pembayaran
 * @param isDefault - Apakah metode pembayaran default
 * @returns Data metode pembayaran yang telah dibuat
 */
export async function addPaymentMethod(
  accountId: string, 
  paymentMethodData: PaymentMethodData, 
  isDefault: boolean = true
): Promise<PaymentMethodResponse> {
  try {
    const response = await killbillClient.post(
      `/1.0/kb/accounts/${accountId}/paymentMethods`, 
      paymentMethodData, 
      {
        headers: {
          ...getCommonHeaders(),
          'X-Killbill-UseGlobalDefault': isDefault.toString()
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
}

/**
 * Mendapatkan metode pembayaran berdasarkan ID
 * @param paymentMethodId - ID metode pembayaran
 * @returns Data metode pembayaran
 */
export async function getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodResponse> {
  try {
    const response = await killbillClient.get(`/1.0/kb/paymentMethods/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    throw error;
  }
}

/**
 * Mendapatkan semua metode pembayaran untuk akun tertentu
 * @param accountId - ID akun
 * @returns Array metode pembayaran
 */
export async function getPaymentMethodsByAccount(accountId: string): Promise<PaymentMethodResponse[]> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/${accountId}/paymentMethods`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods for account:', error);
    throw error;
  }
}

/**
 * Memproses pembayaran untuk invoice
 * @param accountId - ID akun
 * @param paymentData - Data pembayaran
 * @returns Data pembayaran yang telah diproses
 */
export async function processPayment(
  accountId: string, 
  paymentData: PaymentData
): Promise<PaymentResponse> {
  try {
    const response = await killbillClient.post(
      `/1.0/kb/accounts/${accountId}/payments`, 
      paymentData, 
      {
        headers: getCommonHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Mendapatkan pembayaran berdasarkan ID
 * @param paymentId - ID pembayaran
 * @returns Data pembayaran
 */
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  try {
    const response = await killbillClient.get(`/1.0/kb/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

/**
 * Mendapatkan semua pembayaran untuk akun tertentu
 * @param accountId - ID akun
 * @returns Array pembayaran
 */
export async function getPaymentsByAccount(accountId: string): Promise<PaymentResponse[]> {
  try {
    const response = await killbillClient.get(`/1.0/kb/accounts/${accountId}/payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments for account:', error);
    throw error;
  }
}

export default killbillClient;