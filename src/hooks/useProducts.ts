import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DatabaseProduct {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  sku: string | null;
  slug: string | null;
  price_pkr: number;
  discount_price_pkr: number | null;
  stock_count: number;
  images: string[] | null;
  video_url: string | null;
  status: "pending" | "active" | "rejected";
  free_shipping: boolean;
  location: string | null;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price_pkr: number;
  discount_price_pkr: number | null;
  stock_count: number;
  images: string[];
}

// Format price as PKR
export const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
};

// Upload image to Supabase Storage
export const uploadProductImage = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

// Hook for fetching active products (public)
export const useActiveProducts = (limit?: number) => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
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
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error, refetch: fetchProducts };
};

// Hook for searching products
export const useProductSearch = (query: string) => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      setProducts([]);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
        .limit(50);

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error searching products:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error };
};

// Hook for fetching a single product by ID or slug
export const useProduct = (identifier: string | undefined) => {
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (identifier) {
      fetchProduct(identifier);
    }
  }, [identifier]);

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Check if identifier is a UUID or a slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "active");
      
      if (isUUID) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { product, isLoading, error, refetch: () => identifier && fetchProduct(identifier) };
};

// Hook for seller products management
export const useSellerProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSellerProducts();
    }
  }, [user]);

  const fetchSellerProducts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching seller products:", err);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (formData: ProductFormData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        brand: formData.brand || null,
        sku: formData.sku || null,
        price_pkr: formData.price_pkr,
        discount_price_pkr: formData.discount_price_pkr,
        stock_count: formData.stock_count,
        images: formData.images,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Product Submitted",
        description: "Your product has been submitted for approval.",
      });

      await fetchSellerProducts();
      return true;
    } catch (err: any) {
      console.error("Error creating product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create product",
        variant: "destructive",
      });
      return false;
    }
  };

  return { products, isLoading, createProduct, refetch: fetchSellerProducts };
};

// Hook for admin products management
export const useAdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, status: "active" | "rejected"): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: status === "active" ? "Product Approved" : "Product Rejected",
        description: status === "active" 
          ? "Product is now live on the store." 
          : "Product has been rejected.",
        variant: status === "active" ? "default" : "destructive",
      });

      await fetchAllProducts();
      return true;
    } catch (err: any) {
      console.error("Error updating product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update product",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: "Product has been removed.",
      });

      await fetchAllProducts();
      return true;
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
      return false;
    }
  };

  return { products, isLoading, updateProductStatus, deleteProduct, refetch: fetchAllProducts };
};
