import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Cache for prefetched product data
const prefetchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePrefetch = () => {
  const prefetchingRef = useRef<Set<string>>(new Set());

  const prefetchProduct = useCallback(async (productId: string) => {
    // Skip if already prefetching or cached
    if (prefetchingRef.current.has(productId)) return;
    
    const cached = prefetchCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return;

    prefetchingRef.current.add(productId);

    try {
      // Use requestIdleCallback for non-blocking prefetch
      const prefetch = async () => {
        const { data } = await supabase
          .from("products")
          .select("*")
          .or(`id.eq.${productId},slug.eq.${productId}`)
          .eq("status", "active")
          .single();

        if (data) {
          prefetchCache.set(productId, { data, timestamp: Date.now() });
        }
      };

      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback(() => prefetch(), { timeout: 2000 });
      } else {
        setTimeout(prefetch, 100);
      }
    } finally {
      setTimeout(() => {
        prefetchingRef.current.delete(productId);
      }, 500);
    }
  }, []);

  const getPrefetchedProduct = useCallback((productId: string) => {
    const cached = prefetchCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }, []);

  return { prefetchProduct, getPrefetchedProduct };
};

export default usePrefetch;
