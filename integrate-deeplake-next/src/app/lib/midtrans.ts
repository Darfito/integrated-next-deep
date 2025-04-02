// src/lib/midtrans.ts
import { Snap } from 'midtrans-node';

// Detail transaksi untuk membuat transaksi snap
interface TransactionDetail {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  redirectUrl: string;
}

// Inisialisasi Snap client dari midtrans-node
const snap = new Snap({
  isProduction: process.env.MID_IS_PRODUCTION === 'true',
  serverKey: process.env.SECRET_MID || '',
  clientKey: process.env.NEXT_PUBLIC_CLIENT_MID || ''
});

// Membuat transaksi Snap untuk tampilan pembayaran
export const createSnapTransaction = async (transactionDetails: TransactionDetail) => {
  try {
    const parameter = {
      transaction_details: {
        order_id: transactionDetails.orderId,
        gross_amount: transactionDetails.amount
      },
      customer_details: {
        first_name: transactionDetails.customerName,
        email: transactionDetails.customerEmail,
        phone: transactionDetails.customerPhone
      },
      callbacks: {
        finish: transactionDetails.redirectUrl
      }
    };

    const transaction = await snap.createTransaction(parameter);
    return transaction;
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    throw error;
  }
};

export { snap };