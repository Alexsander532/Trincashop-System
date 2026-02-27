export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
