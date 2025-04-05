export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  expiryDate?: string;
}

export interface Sale {
  id: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  date: string;
  cashierId: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lastUpdated: string;
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalSales: number;
  totalProfit: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
} 