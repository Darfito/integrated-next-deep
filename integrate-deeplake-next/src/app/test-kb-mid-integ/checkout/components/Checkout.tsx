"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import axios from "axios";
import { plans } from "../../data/data";
import { Plan } from "../../type";


export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State untuk menampung data plan yang dipilih
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStep, setActiveStep] = useState(0);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Ambil nilai "plan" dari query string
  const planId = searchParams.get("plan");

  useEffect(() => {
    // Cari plan yang sesuai dengan planId
    const foundPlan = plans.find((p: { id: string | null; }) => p.id === planId);

    if (foundPlan) {
      setPlan(foundPlan);
    } else {
      // Jika plan tidak ditemukan, redirect
      router.push("/test-kb-mid-integ");
    }

    // Load Midtrans snap
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_CLIENT_MID || ""
    );
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [planId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Buat akun di Kill Bill
      const accountResponse = await axios.post("/api/killbill/accounts", {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        currency: "IDR",
      });

      const accountId = accountResponse.data.accountId;
      console.log("Account created with ID:", accountId);

      // Buat langganan
      const subscriptionResponse = await axios.post(
        "/api/killbill/subscriptions",
        {
          accountId,
          subscriptionData: {
            planName: planId,
            productCategory: "BASE",
            billingPeriod: "MONTHLY",
            priceList: "DEFAULT",
          },
        }
      );
      console.log("Subscription created:", subscriptionResponse.data);

      // Proses pembayaran
      const paymentResponse = await axios.post("/api/killbill/payments", {
        accountId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      });
      console.log("Payment initiated:", paymentResponse.data);

      // Jika plan gratis, langsung ke halaman sukses
      if (plan?.price === 0) {
        router.push(
          `/test-kb-mid-integ/success?invoiceId=${paymentResponse.data.invoiceId}`
        );
        return;
      }

      // Tampilkan Snap Midtrans untuk plan berbayar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).snap && paymentResponse.data.token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).pay(paymentResponse.data.token, {

          onSuccess: (result: unknown) => {
            console.log("Payment success:", result);
            router.push(
              `/test-kb-mid-integ/success?invoiceId=${paymentResponse.data.invoiceId}`
            );
          },
          onPending: (result: unknown) => {
            console.log("Payment pending:", result);
            router.push(
              `/test-kb-mid-integ/pending?invoiceId=${paymentResponse.data.invoiceId}`
            );
          },
          onError: (result: unknown) => {
            console.error("Payment error:", result);
            setError("Pembayaran gagal. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: () => {
            console.log("Payment window closed");
            setError(
              "Anda menutup halaman pembayaran sebelum menyelesaikan transaksi."
            );
            setLoading(false);
          },
        });
      } else {
        // Fallback jika Snap tidak tersedia
        if (paymentResponse.data.redirectUrl) {
          window.location.href = paymentResponse.data.redirectUrl;
        } else {
          router.push(
            `/test-kb-mid-integ/success?invoiceId=${paymentResponse.data.invoiceId}`
          );
        }
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      setError("Terjadi kesalahan saat checkout. Silakan coba lagi.");
      setLoading(false);
    }
  };

  // Jika plan belum ditemukan
  if (!plan) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Informasi Pelanggan</StepLabel>
          </Step>
          <Step>
            <StepLabel>
              {plan.price === 0 ? "Konfirmasi" : "Pembayaran"}
            </StepLabel>
          </Step>
        </Stepper>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* FORM */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Informasi Pelanggan
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                name="name"
                value={customer.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={customer.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Nomor Telepon"
                name="phone"
                value={customer.phone}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="outlined"
                  onClick={() => router.push("/test-kb-mid-integ")}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading
                    ? "Memproses..."
                    : plan.price === 0
                    ? "Konfirmasi Pendaftaran"
                    : "Lanjutkan ke Pembayaran"}
                </Button>
              </Box>
            </form>
          </Box>

          {/* RINGKASAN PESANAN */}
          <Box sx={{ flex: { xs: "unset", md: "0 0 40%" } }}>
            <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Ringkasan Pesanan
              </Typography>
              <Box sx={{ my: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Paket:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {plan.title}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Periode:</Typography>
                  <Typography variant="body1">Bulanan</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {plan.price === 0
                    ? "Gratis"
                    : `Rp ${plan.price.toLocaleString("id-ID")}`}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
