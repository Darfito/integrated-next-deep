import { Plan } from "../type";

export const plans: Plan[] = [
    {
      id: 'Subscription-Monthly-Free',
      title: 'Free Plan',
      price: 0,
      description: 'Paket dasar gratis untuk mencoba layanan',
      features: [
        'Akses dasar ke platform',
        'Fitur-fitur standar',
        'Dukungan komunitas',
        'Penyimpanan 1GB'
      ]
    },
    {
      id: 'Subscription-Monthly-Premium',
      title: 'Premium Plan',
      price: 200000,
      description: 'Paket lengkap dengan fitur premium',
      features: [
        'Semua fitur paket gratis',
        'Fitur-fitur premium',
        'Dukungan prioritas',
        'Penyimpanan 50GB',
        'Periode uji coba 2 hari'
      ],
      popular: true
    }
  ];