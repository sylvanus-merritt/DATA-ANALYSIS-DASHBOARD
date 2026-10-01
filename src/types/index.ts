export interface OrderItem {
  id: string;
  orderNumber: string;
  product: string;
  price: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  dayOfWeekIndex: number; // 0 for Sunday or 1 for Monday
  weekLabel: string; // e.g., 'W33 (Aug 11-17)'
  priceTier: 'Economy (<$70)' | 'Mid-Tier ($70-$100)' | 'Premium (>$100)';
}

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'eWallet' | 'Cash';

export interface FilterState {
  searchQuery: string;
  dateRange: {
    start: string;
    end: string;
  };
  selectedProducts: string[];
  selectedPaymentMethods: string[];
  priceRange: [number, number];
  basketFilter: 'all' | 'single-item' | 'multi-item';
}

export type DashboardTab = 'overview' | 'products' | 'temporal' | 'basket-payment' | 'custom-studio' | 'ledger';

export type CustomChartType = 'bar' | 'horizontal-bar' | 'area' | 'line' | 'pie' | 'donut' | 'radar';
export type CustomDimension = 'product' | 'paymentMethod' | 'dayOfWeek' | 'weekLabel' | 'date' | 'priceTier';
export type CustomMetric = 'revenue' | 'units' | 'orders' | 'avgPrice';
export type CustomSort = 'desc' | 'asc' | 'alpha' | 'chrono';
