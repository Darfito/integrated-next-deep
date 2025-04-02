"use client";

import { Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { plans } from "../data/data";
import PlanCard from "./PlanCard";

// Data paket langganan sesuai katalog Kill Bill
export default function KillBillMidtransIntegration() {
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    router.push(`/test-kb-mid-integ/checkout?plan=${planId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" gutterBottom>
          Kill Bill + Midtrans POC
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={2}>
          Pilih paket yang sesuai dengan kebutuhan Anda
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Integrasi sistem penagihan Kill Bill dengan payment gateway Midtrans
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {plans.map((plan) => (
          <Box
            key={plan.id}
            sx={{
              width: {
                xs: "100%",
                md: "calc(50% - 32px)",
              },
            }}
          >
            <PlanCard plan={plan} onSelect={() => handleSelectPlan(plan.id)} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
