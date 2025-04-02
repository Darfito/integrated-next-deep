export interface Plan {
    id: string;
    title: string;
    price: number;
    description?: string;
    features?: string[];
    popular?: boolean;
  }