/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  Chip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import axios from 'axios';

export default function Success() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/killbill/invoices?invoiceId=${invoiceId}`);
      console.log("Invoice details:", response.data);
      setInvoice(response.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Tidak dapat mengambil detail invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Terjadi Kesalahan
          </Typography>
          <Typography>{error || 'Invoice tidak ditemukan'}</Typography>
          <Button 
            component={Link} 
            href="/test-kb-mid-integ" 
            variant="contained" 
            sx={{ mt: 3 }}
          >
            Kembali ke Beranda
          </Button>
        </Paper>
      </Container>
    );
  }

  // Cek apakah paket yang dipilih adalah Free atau Premium
  const isPremium = invoice.amount > 0;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CheckCircleIcon 
            sx={{ fontSize: 60, color: 'success.main', mb: 2 }} 
          />
          <Typography variant="h4" gutterBottom>
            {isPremium ? 'Pembayaran Berhasil' : 'Pendaftaran Berhasil'}
          </Typography>
          <Typography color="text.secondary">
            {isPremium 
              ? 'Terima kasih atas pembayaran Anda. Langganan Premium Anda sekarang aktif.'
              : 'Terima kasih atas pendaftaran Anda. Akun Free Plan Anda sekarang aktif.'
            }
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detail Invoice
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">ID Invoice</Typography>
            <Typography>{invoice.invoiceId}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Tanggal</Typography>
            <Typography>
              {new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Status</Typography>
            <Chip 
              label={invoice.status || 'PAID'} 
              color="success" 
              size="small" 
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <Typography>Total</Typography>
            <Typography>
              {invoice.amount === 0
                ? 'Gratis'
                : `${invoice.currency} ${invoice.amount.toLocaleString('id-ID')}`
              }
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/test-kb-mid-integ"
            variant="outlined"
          >
            Kembali ke Beranda
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}