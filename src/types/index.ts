export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
}

export interface ProductVariant {
  colors?: { name: string; hex: string }[];
  ram?: string[];
  storage?: string[];
  sizes?: string[];
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category_id: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
  variants: ProductVariant;
  specifications: Specification[];
  stock: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  sold_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedRam?: string;
  selectedStorage?: string;
  selectedSize?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  selected_color?: string;
  selected_ram?: string;
  selected_storage?: string;
  selected_size?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_method: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  items: OrderItem[];
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'admin';
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  is_default: boolean;
}
