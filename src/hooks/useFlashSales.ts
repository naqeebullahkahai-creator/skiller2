import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface FlashSaleNomination {
  id: string;
  seller_id: string;
  product_id: string;
  flash_sale_id: string | null;
  proposed_price_pkr: number;
  original_price_pkr: number;
  stock_limit: number;
  time_slot_start: string;
  time_slot_end: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  product?: {
    id: string;
    title: string;
    images: string[] | null;
    price_pkr: number;
    category: string;
  };
  seller?: { full_name: string; email: string };
}

export interface ActiveFlashSaleProduct {
  id: string;
  flash_sale_id: string;
  product_id: string;
  flash_price_pkr: number;
  original_price_pkr: number;
  stock_limit: number;
  sold_count: number;
  product: {
    id: string;
    title: string;
    images: string[] | null;
    price_pkr: number;
    discount_price_pkr: number | null;
    category: string;
    brand: string | null;
    stock_count: number;
    seller_id: string;
  };
  flash_sale: {
    id: string;
    campaign_name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
  };
}

// Hook for sellers to manage their flash sale nominations
export const useSellerFlashNominations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nominations = [], isLoading } = useQuery({
    queryKey: ["seller-flash-nominations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("flash_sale_nominations")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch products separately
      const productIds = data.map(n => n.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, title, images, price_pkr, category")
        .in("id", productIds);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      
      return data.map(nom => ({
        ...nom,
        product: productMap.get(nom.product_id),
      })) as FlashSaleNomination[];
    },
    enabled: !!user,
  });

  const createNomination = async (data: {
    product_id: string;
    proposed_price_pkr: number;
    original_price_pkr: number;
    stock_limit: number;
    time_slot_start: string;
    time_slot_end: string;
  }) => {
    if (!user) return false;

    const { error } = await supabase.from("flash_sale_nominations").insert([{
      ...data,
      seller_id: user.id,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("20%") 
          ? "Flash sale discount must be at least 20%" 
          : error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({ title: "Success", description: "Nomination submitted for approval!" });
    queryClient.invalidateQueries({ queryKey: ["seller-flash-nominations"] });
    return true;
  };

  const deleteNomination = async (id: string) => {
    const { error } = await supabase
      .from("flash_sale_nominations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["seller-flash-nominations"] });
    return true;
  };

  return { nominations, isLoading, createNomination, deleteNomination };
};

// Hook for admin to manage flash sale nominations
export const useAdminFlashNominations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nominations = [], isLoading } = useQuery({
    queryKey: ["admin-flash-nominations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sale_nominations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch products and profiles separately
      const productIds = data.map(n => n.product_id);
      const sellerIds = data.map(n => n.seller_id);
      
      const [productsRes, profilesRes] = await Promise.all([
        supabase.from("products").select("id, title, images, price_pkr, category").in("id", productIds),
        supabase.from("profiles").select("id, full_name, email").in("id", sellerIds),
      ]);

      const productMap = new Map(productsRes.data?.map(p => [p.id, p]) || []);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      
      return data.map(nom => ({
        ...nom,
        product: productMap.get(nom.product_id),
        seller: profileMap.get(nom.seller_id),
      })) as FlashSaleNomination[];
    },
  });

  const approveNomination = async (nomination: FlashSaleNomination, flashSaleId: string) => {
    // First add product to flash sale
    const { error: addError } = await supabase.from("flash_sale_products").insert([{
      flash_sale_id: flashSaleId,
      product_id: nomination.product_id,
      flash_price_pkr: nomination.proposed_price_pkr,
      original_price_pkr: nomination.original_price_pkr,
      stock_limit: nomination.stock_limit,
    }]);

    if (addError) {
      toast({ title: "Error", description: addError.message, variant: "destructive" });
      return false;
    }

    // Update nomination status
    const { error: updateError } = await supabase
      .from("flash_sale_nominations")
      .update({ status: "approved", flash_sale_id: flashSaleId })
      .eq("id", nomination.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "Nomination approved and added to flash sale!" });
    queryClient.invalidateQueries({ queryKey: ["admin-flash-nominations"] });
    queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
    return true;
  };

  const rejectNomination = async (id: string, adminNotes?: string) => {
    const { error } = await supabase
      .from("flash_sale_nominations")
      .update({ status: "rejected", admin_notes: adminNotes || null })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "Nomination rejected" });
    queryClient.invalidateQueries({ queryKey: ["admin-flash-nominations"] });
    return true;
  };

  return { nominations, isLoading, approveNomination, rejectNomination };
};

// Hook for getting active flash sale products (customer-facing)
export const useActiveFlashSaleProducts = () => {
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["active-flash-sale-products"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // Get active flash sales first
      const { data: flashSales, error: flashError } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now);

      if (flashError || !flashSales?.length) return [];

      const flashSaleIds = flashSales.map(fs => fs.id);
      
      // Get flash sale products
      const { data: flashProducts, error: productsError } = await supabase
        .from("flash_sale_products")
        .select("*")
        .in("flash_sale_id", flashSaleIds);

      if (productsError || !flashProducts?.length) return [];

      // Get product details
      const productIds = flashProducts.map(fp => fp.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, title, images, price_pkr, discount_price_pkr, category, brand, stock_count, seller_id")
        .in("id", productIds);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const flashSaleMap = new Map(flashSales.map(fs => [fs.id, fs]));

      return flashProducts.map(fp => ({
        ...fp,
        product: productMap.get(fp.product_id)!,
        flash_sale: flashSaleMap.get(fp.flash_sale_id)!,
      })).filter(fp => fp.product) as ActiveFlashSaleProduct[];
    },
    refetchInterval: 60000, // Refetch every minute to keep countdown accurate
  });

  // Get the active flash sale end time
  const activeFlashSale = products[0]?.flash_sale;
  const endTime = activeFlashSale?.end_date ? new Date(activeFlashSale.end_date) : null;

  return { products, isLoading, endTime, refetch };
};

// Hook to increment sold count when purchased
export const useIncrementFlashSaleSold = () => {
  const queryClient = useQueryClient();

  const incrementSold = async (flashSaleId: string, productId: string, quantity: number) => {
    const { error } = await supabase.rpc("increment_flash_sale_sold", {
      p_flash_sale_id: flashSaleId,
      p_product_id: productId,
      p_quantity: quantity,
    });

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["active-flash-sale-products"] });
    }
  };

  return { incrementSold };
};
