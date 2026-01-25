import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

/**
 * Hook for real-time product updates
 * Listens to INSERT, UPDATE, DELETE events on products table
 */
export const useRealtimePendingProducts = (initialProducts: Product[]) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const channel = supabase
      .channel("pending-products-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "products",
          filter: "status=eq.pending",
        },
        (payload) => {
          const newProduct = payload.new as Product;
          setProducts((prev) => {
            // Avoid duplicates
            if (prev.some((p) => p.id === newProduct.id)) return prev;
            return [newProduct, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
        },
        (payload) => {
          const updatedProduct = payload.new as Product;
          setProducts((prev) => {
            // If product is no longer pending, remove it
            if (updatedProduct.status !== "pending") {
              return prev.filter((p) => p.id !== updatedProduct.id);
            }
            // Otherwise update it
            return prev.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            );
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "products",
        },
        (payload) => {
          const deletedId = payload.old.id;
          setProducts((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return products;
};

/**
 * Hook for real-time stock updates on a single product
 */
export const useRealtimeProductStock = (productId: string | undefined) => {
  const [stockCount, setStockCount] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    // Fetch initial stock
    const fetchStock = async () => {
      const { data } = await supabase
        .from("products")
        .select("stock_count")
        .eq("id", productId)
        .maybeSingle();
      
      if (data) setStockCount(data.stock_count);
    };
    fetchStock();

    // Subscribe to updates
    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const updated = payload.new as Product;
          setStockCount(updated.stock_count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return stockCount;
};

/**
 * Hook for real-time active products list
 */
export const useRealtimeActiveProducts = (initialProducts: Product[]) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const channel = supabase
      .channel("active-products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newProduct = payload.new as Product;
            if (newProduct.status === "active") {
              setProducts((prev) => {
                if (prev.some((p) => p.id === newProduct.id)) return prev;
                return [newProduct, ...prev];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedProduct = payload.new as Product;
            setProducts((prev) => {
              if (updatedProduct.status === "active") {
                // Add or update
                const exists = prev.some((p) => p.id === updatedProduct.id);
                if (exists) {
                  return prev.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p
                  );
                }
                return [updatedProduct, ...prev];
              } else {
                // Remove if not active
                return prev.filter((p) => p.id !== updatedProduct.id);
              }
            });
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setProducts((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return products;
};
