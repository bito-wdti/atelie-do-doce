export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  status: 'In Stock' | 'Out of Stock';
  stock?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerInitials: string;
  date: string;
  total: number;
  status: 'Pending' | 'In Preparation' | 'Delivered' | 'Canceled';
  items: string[];
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  customer: string;
  doc: string;
  value: number;
  status: 'Authorized' | 'Canceled';
}