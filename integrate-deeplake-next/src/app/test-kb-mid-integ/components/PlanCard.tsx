import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";

interface PlanProps {
  plan: {
    id: string;
    title: string;
    price: number;
    description?: string;
    features?: string[];
    popular?: boolean;
  };
  onSelect: () => void;
}

export default function PlanCard({ plan, onSelect }: PlanProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: plan.popular ? "2px solid" : "1px solid",
        borderColor: plan.popular ? "primary.main" : "grey.300",
        position: "relative",
      }}
    >
      {plan.popular && (
        <Box
          sx={{
            position: "absolute",
            top: -12,
            right: 24,
            bgcolor: "primary.main",
            color: "white",
            py: 0.5,
            px: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2">Rekomendasi</Typography>
        </Box>
      )}
      <CardHeader
        title={plan.title}
        sx={{
          bgcolor: plan.popular ? "primary.light" : "grey.100",
          color: plan.popular ? "white" : "inherit",
          textAlign: "center",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h3" component="div">
            {plan.price === 0
              ? "Gratis"
              : `Rp ${plan.price.toLocaleString("id-ID")}`}
          </Typography>
          {plan.price > 0 && (
            <Typography variant="subtitle1" color="text.secondary">
              per bulan
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {plan.description}
        </Typography>
        <List dense>
          {(plan.features ?? []).map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={plan.popular ? "contained" : "outlined"}
          color="primary"
          size="large"
          onClick={onSelect}
        >
          {plan.price === 0 ? "Daftar Gratis" : "Pilih Paket"}
        </Button>
      </CardActions>
    </Card>
  );
}
