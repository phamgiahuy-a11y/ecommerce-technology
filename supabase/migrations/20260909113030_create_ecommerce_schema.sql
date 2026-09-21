/*
# TECHZONE E-commerce Schema

Creates the complete database schema for a technology e-commerce store.

## Tables
- `categories` - Product categories (Smartphones, Laptops, Tablets, Gaming, Accessories)
- `products` - Products with JSONB fields for images, variants, specifications
- `reviews` - Customer product reviews with ratings
- `coupons` - Discount coupons
- `profiles` - User profiles with role (customer/admin), auto-created on signup
- `orders` - Customer orders with embedded order items (JSONB)
- `wishlist` - User wishlist items
- `addresses` - User shipping addresses

## Security
- RLS enabled on all tables
- Products, categories, coupons, reviews: readable by everyone (anon + authenticated)
- Products/coupons/categories: writable by admin only (via is_admin() function)
- Orders, wishlist, addresses: owner-scoped CRUD (auth.uid() = user_id)
- Profiles: users read/update own profile; admin can read all
- `is_admin()` SECURITY DEFINER function checks profile role

## Notes
- Prices stored as bigint (VND has no decimals)
- Product images, variants, specifications stored as JSONB
- Order items embedded as JSONB for historical record
- Auto profile creation trigger on auth.users insert
*/

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  image text,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  description text,
  price bigint NOT NULL,
  sale_price bigint,
  images jsonb NOT NULL DEFAULT '[]',
  variants jsonb DEFAULT '{}',
  specifications jsonb DEFAULT '[]',
  stock int NOT NULL DEFAULT 0,
  rating numeric(2,1) DEFAULT 0,
  review_count int DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_flash_sale boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  sold_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid(),
  user_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value int NOT NULL,
  min_order bigint DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_district text,
  shipping_method text NOT NULL,
  payment_method text NOT NULL,
  subtotal bigint NOT NULL,
  shipping_fee bigint NOT NULL DEFAULT 0,
  discount bigint NOT NULL DEFAULT 0,
  total bigint NOT NULL,
  coupon_code text,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  district text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Helper: is_admin function (SECURITY DEFINER to bypass RLS on profiles lookup)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
DROP POLICY IF EXISTS "read_categories" ON public.categories;
CREATE POLICY "read_categories" ON public.categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
CREATE POLICY "admin_insert_categories" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
CREATE POLICY "admin_update_categories" ON public.categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
CREATE POLICY "admin_delete_categories" ON public.categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- Products policies (public read, admin write)
DROP POLICY IF EXISTS "read_products" ON public.products;
CREATE POLICY "read_products" ON public.products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admin_insert_products" ON public.products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products" ON public.products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE
  TO authenticated USING (public.is_admin());

-- Reviews policies (public read, authenticated insert own, owner update/delete)
DROP POLICY IF EXISTS "read_reviews" ON public.reviews;
CREATE POLICY "read_reviews" ON public.reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_reviews" ON public.reviews;
CREATE POLICY "insert_own_reviews" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reviews" ON public.reviews;
CREATE POLICY "update_own_reviews" ON public.reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reviews" ON public.reviews;
CREATE POLICY "delete_own_reviews" ON public.reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Coupons policies (public read, admin write)
DROP POLICY IF EXISTS "read_coupons" ON public.coupons;
CREATE POLICY "read_coupons" ON public.coupons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_coupons" ON public.coupons;
CREATE POLICY "admin_insert_coupons" ON public.coupons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_coupons" ON public.coupons;
CREATE POLICY "admin_update_coupons" ON public.coupons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_coupons" ON public.coupons;
CREATE POLICY "admin_delete_coupons" ON public.coupons FOR DELETE
  TO authenticated USING (public.is_admin());

-- Profiles policies (owner read/update, admin read all)
DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
CREATE POLICY "read_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Orders policies (owner CRUD, admin update status)
DROP POLICY IF EXISTS "read_own_orders" ON public.orders;
CREATE POLICY "read_own_orders" ON public.orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
CREATE POLICY "insert_own_orders" ON public.orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders" ON public.orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Wishlist policies (owner CRUD)
DROP POLICY IF EXISTS "read_own_wishlist" ON public.wishlist;
CREATE POLICY "read_own_wishlist" ON public.wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlist" ON public.wishlist;
CREATE POLICY "insert_own_wishlist" ON public.wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlist" ON public.wishlist;
CREATE POLICY "delete_own_wishlist" ON public.wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Addresses policies (owner CRUD)
DROP POLICY IF EXISTS "read_own_addresses" ON public.addresses;
CREATE POLICY "read_own_addresses" ON public.addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON public.addresses;
CREATE POLICY "insert_own_addresses" ON public.addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON public.addresses;
CREATE POLICY "update_own_addresses" ON public.addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON public.addresses;
CREATE POLICY "delete_own_addresses" ON public.addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'admin@techzone.vn' THEN 'admin' ELSE 'customer' END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);