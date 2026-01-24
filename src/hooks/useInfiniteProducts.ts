import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseProduct } from "./useProducts";

const PAGE_SIZE = 20;

interface ProductsPage {
  products: DatabaseProduct[];
  nextPage: number | null;
  totalCount: number;
}

const fetchProductsPage = async ({ pageParam = 0 }): Promise<ProductsPage> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Get total count for progress indication
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const totalCount = count || 0;
  const hasMore = (pageParam + 1) * PAGE_SIZE < totalCount;

  return {
    products: data || [],
    nextPage: hasMore ? pageParam + 1 : null,
    totalCount,
  };
};

export const useInfiniteProducts = () => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite"],
    queryFn: fetchProductsPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - stale-while-revalidate
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
  });
};

// Category-specific infinite products
export const useInfiniteProductsByCategory = (category: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", "category", category],
    queryFn: async ({ pageParam = 0 }): Promise<ProductsPage> => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (category) {
        query = query.ilike("category", `%${category}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      const totalCount = count || 0;
      const hasMore = (pageParam + 1) * PAGE_SIZE < totalCount;

      return {
        products: data || [],
        nextPage: hasMore ? pageParam + 1 : null,
        totalCount,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: true,
  });
};

// Search with infinite scroll
export const useInfiniteProductSearch = (searchQuery: string) => {
  return useInfiniteQuery({
    queryKey: ["products", "search", searchQuery],
    queryFn: async ({ pageParam = 0 }): Promise<ProductsPage> => {
      if (!searchQuery.trim()) {
        return { products: [], nextPage: null, totalCount: 0 };
      }

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalCount = count || 0;
      const hasMore = (pageParam + 1) * PAGE_SIZE < totalCount;

      return {
        products: data || [],
        nextPage: hasMore ? pageParam + 1 : null,
        totalCount,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: searchQuery.trim().length > 0,
  });
};
