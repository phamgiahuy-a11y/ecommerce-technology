import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category, Review, Coupon } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
      setLoading(false);
    })();
  }, []);

  return { categories, loading };
}

export function useProducts(filters?: {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'price-asc' | 'price-desc' | 'popularity' | 'newest';
  featured?: boolean;
  flashSale?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (filters?.category && filters.category !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .maybeSingle();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (filters?.brand && filters.brand !== 'all') {
      query = query.eq('brand', filters.brand);
    }

    if (filters?.flashSale) query = query.eq('is_flash_sale', true);
    if (filters?.bestSeller) query = query.eq('is_best_seller', true);
    if (filters?.newArrival) query = query.eq('is_new_arrival', true);
    if (filters?.featured) query = query.eq('is_featured', true);

    if (filters?.sort === 'price-asc') query = query.order('sale_price', { ascending: true, nullsFirst: false });
    else if (filters?.sort === 'price-desc') query = query.order('sale_price', { ascending: false, nullsFirst: true });
    else if (filters?.sort === 'popularity') query = query.order('sold_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    if (filters?.limit) query = query.limit(filters.limit);

    const { data } = await query;
    let result = (data || []) as Product[];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter((p) => (p.sale_price ?? p.price) >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((p) => (p.sale_price ?? p.price) <= filters.maxPrice!);
    }
    if (filters?.minRating !== undefined) {
      result = result.filter((p) => p.rating >= filters.minRating!);
    }

    setProducts(result);
    setLoading(false);
  }, [filters?.category, filters?.brand, filters?.search, filters?.minPrice, filters?.maxPrice, filters?.minRating, filters?.sort, filters?.flashSale, filters?.bestSeller, filters?.newArrival, filters?.featured, filters?.limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setProduct(data as Product | null);
      setLoading(false);
    })();
  }, [slug]);

  return { product, loading };
}

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, refetch: fetchReviews };
}

export function useRelatedProducts(product: Product | null) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(4);
      setRelated(data || []);
      setLoading(false);
    })();
  }, [product]);

  return { related, loading };
}

export function useBrands() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('brand');
      const unique = [...new Set((data || []).map((p: { brand: string }) => p.brand))].sort();
      setBrands(unique);
      setLoading(false);
    })();
  }, []);

  return { brands, loading };
}

export function useCoupon(code: string) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();
    setCoupon(data as Coupon | null);
    setLoading(false);
  }, [code]);

  useEffect(() => {
    if (code) validate();
  }, [code, validate]);

  return { coupon, loading };
}
