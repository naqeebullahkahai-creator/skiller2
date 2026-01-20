import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_value: string;
  additional_price_pkr: number;
  stock_count: number;
  created_at: string;
  updated_at: string;
}

export interface VariantFormData {
  variant_name: string;
  variant_value: string;
  additional_price_pkr: number;
  stock_count: number;
}

// Hook for fetching variants for a product (public)
export const useProductVariants = (productId: string | undefined) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchVariants(productId);
    } else {
      setVariants([]);
      setIsLoading(false);
    }
  }, [productId]);

  const fetchVariants = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .order("variant_name", { ascending: true })
        .order("additional_price_pkr", { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (err: any) {
      console.error("Error fetching variants:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group variants by name (e.g., Size, Color)
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.variant_name]) {
      acc[variant.variant_name] = [];
    }
    acc[variant.variant_name].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  return { 
    variants, 
    groupedVariants, 
    isLoading, 
    error, 
    refetch: () => productId && fetchVariants(productId) 
  };
};

// Hook for managing seller product variants
export const useSellerProductVariants = (productId: string | undefined) => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchVariants(productId);
    }
  }, [productId]);

  const fetchVariants = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .order("variant_name", { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (err: any) {
      console.error("Error fetching variants:", err);
      toast({
        title: "Error",
        description: "Failed to load variants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = async (variantData: VariantFormData): Promise<boolean> => {
    if (!productId) return false;

    try {
      const { error } = await supabase.from("product_variants").insert({
        product_id: productId,
        ...variantData,
      });

      if (error) throw error;

      toast({
        title: "Variant Added",
        description: `${variantData.variant_name}: ${variantData.variant_value} added successfully.`,
      });

      await fetchVariants(productId);
      return true;
    } catch (err: any) {
      console.error("Error adding variant:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add variant",
        variant: "destructive",
      });
      return false;
    }
  };

  const addMultipleVariants = async (variantsData: VariantFormData[]): Promise<boolean> => {
    if (!productId || variantsData.length === 0) return false;

    try {
      const variantsToInsert = variantsData.map((v) => ({
        product_id: productId,
        ...v,
      }));

      const { error } = await supabase.from("product_variants").insert(variantsToInsert);

      if (error) throw error;

      toast({
        title: "Variants Added",
        description: `${variantsData.length} variants added successfully.`,
      });

      await fetchVariants(productId);
      return true;
    } catch (err: any) {
      console.error("Error adding variants:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add variants",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateVariant = async (variantId: string, variantData: Partial<VariantFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("product_variants")
        .update(variantData)
        .eq("id", variantId);

      if (error) throw error;

      toast({
        title: "Variant Updated",
        description: "Variant updated successfully.",
      });

      if (productId) await fetchVariants(productId);
      return true;
    } catch (err: any) {
      console.error("Error updating variant:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update variant",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteVariant = async (variantId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (error) throw error;

      toast({
        title: "Variant Deleted",
        description: "Variant deleted successfully.",
      });

      if (productId) await fetchVariants(productId);
      return true;
    } catch (err: any) {
      console.error("Error deleting variant:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete variant",
        variant: "destructive",
      });
      return false;
    }
  };

  return { 
    variants, 
    isLoading, 
    addVariant, 
    addMultipleVariants, 
    updateVariant, 
    deleteVariant, 
    refetch: () => productId && fetchVariants(productId) 
  };
};
