export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  flavor: string;
  category: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  pickup_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  flavor: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type Rating = {
  id: string;
  user_id: string;
  menu_item_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type BestSellingFlavor = {
  flavor: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
};
