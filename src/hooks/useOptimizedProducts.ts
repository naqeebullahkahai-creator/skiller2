import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseProduct } from "./useProducts";

// Optimized hook with React Query caching and stale-while-revalidate
export const useOptimizedActiveProducts = (limit?: number) => {
  return useQuery({
    queryKey: ["products", "active", limit],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DatabaseProduct[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Single product with caching
export const useOptimizedProduct = (identifier: string | undefined) => {
  return useQuery({
    queryKey: ["product", identifier],
    queryFn: async () => {
      if (!identifier) return null;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "active");
      
      if (isUUID) {
        query = query.eq("id", identifier);
      } else {
        query = query.eq("slug", identifier);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as DatabaseProduct | null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
    gcTime: 60 * 60 * 1000, // 1 hour cache
    enabled: !!identifier,
  });
};

// Homepage products - critical path, aggressively cached
export const useHomepageProducts = () => {
  return useQuery({
    queryKey: ["products", "homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, slug, price_pkr, discount_price_pkr, images, brand, stock_count, category")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(24); // First 2 rows on most screens

      if (error) throw error;
      return data as DatabaseProduct[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Flash sale products - priority loading
export const useFlashSaleProductsOptimized = () => {
  return useQuery({
    queryKey: ["flash-sale", "products"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data: flashSale, error: flashError } = await supabase
        .from("flash_sales")
        .select("id")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .maybeSingle();

      if (flashError || !flashSale) return [];

      const { data, error } = await supabase
        .from("flash_sale_products")
        .select(`
          id,
          flash_price_pkr,
          original_price_pkr,
          stock_limit,
          sold_count,
          product:products(id, title, slug, images, brand, category)
        `)
        .eq("flash_sale_id", flashSale.id)
        .limit(12);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 minute for flash sales
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
