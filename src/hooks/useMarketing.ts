import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface FlashSale {
  id: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface FlashSaleProduct {
  id: string;
  flash_sale_id: string;
  product_id: string;
  flash_price_pkr: number;
  original_price_pkr: number;
  stock_limit: number;
  sold_count: number;
  product?: {
    id: string;
    title: string;
    images: string[] | null;
    category: string;
  };
}

export interface Voucher {
  id: string;
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  minimum_spend_pkr: number;
  expiry_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  image_url: string;
  link_type: string;
  link_value: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: "order" | "price_drop" | "promotion" | "system";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Hook for active flash sales (customer-facing)
export const useActiveFlashSales = () => {
  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["active-flash-sales"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FlashSale[];
    },
  });

  return { flashSales, isLoading };
};

// Hook for flash sale products
export const useFlashSaleProducts = (flashSaleId?: string) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["flash-sale-products", flashSaleId],
    queryFn: async () => {
      let query = supabase
        .from("flash_sale_products")
        .select(`
          *,
          product:products(id, title, images, category, stock_count)
        `);

      if (flashSaleId) {
        query = query.eq("flash_sale_id", flashSaleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (FlashSaleProduct & { product: any })[];
    },
    enabled: !!flashSaleId || true,
  });

  return { products, isLoading };
};

// Hook for admin flash sale management
export const useAdminFlashSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["admin-flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FlashSale[];
    },
  });

  const createFlashSale = async (data: {
    campaign_name: string;
    start_date: string;
    end_date: string;
    application_deadline?: string;
    fee_per_product_pkr?: number;
  }) => {
    const insertData = {
      campaign_name: data.campaign_name,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'draft' as const,
      ...(data.application_deadline && { application_deadline: data.application_deadline }),
      ...(data.fee_per_product_pkr !== undefined && { fee_per_product_pkr: data.fee_per_product_pkr }),
    };

    const { data: newSale, error } = await supabase
      .from("flash_sales")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }

    toast({ title: "Success", description: "Flash sale campaign created!" });
    queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
    return newSale;
  };

  const addProductToSale = async (data: {
    flash_sale_id: string;
    product_id: string;
    flash_price_pkr: number;
    original_price_pkr: number;
    stock_limit: number;
  }) => {
    const { error } = await supabase.from("flash_sale_products").insert([data]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "Product added to flash sale!" });
    queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
    return true;
  };

  const removeProductFromSale = async (id: string) => {
    const { error } = await supabase.from("flash_sale_products").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
    return true;
  };

  const toggleFlashSaleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("flash_sales")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
    queryClient.invalidateQueries({ queryKey: ["active-flash-sales"] });
    return true;
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
  };

  return {
    flashSales,
    isLoading,
    createFlashSale,
    addProductToSale,
    removeProductFromSale,
    toggleFlashSaleActive,
    refetch,
  };
};

// Hook for admin voucher management
export const useAdminVouchers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Voucher[];
    },
  });

  const createVoucher = async (data: {
    code: string;
    discount_type: "fixed" | "percentage";
    discount_value: number;
    minimum_spend_pkr: number;
    expiry_date: string;
    usage_limit?: number;
  }) => {
    const { error } = await supabase.from("vouchers").insert([{
      ...data,
      code: data.code.toUpperCase(),
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "Voucher created!" });
    queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    return true;
  };

  const toggleVoucherActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("vouchers")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    return true;
  };

  const deleteVoucher = async (id: string) => {
    const { error } = await supabase.from("vouchers").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    return true;
  };

  return { vouchers, isLoading, createVoucher, toggleVoucherActive, deleteVoucher };
};

// Hook for admin banner management
export const useAdminBanners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HeroBanner[];
    },
  });

  const createBanner = async (data: {
    title: string;
    image_url: string;
    link_type: string;
    link_value?: string;
    display_order?: number;
  }) => {
    const { error } = await supabase.from("hero_banners").insert([data]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "Banner created!" });
    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    queryClient.invalidateQueries({ queryKey: ["active-banners"] });
    return true;
  };

  const updateBanner = async (id: string, data: Partial<HeroBanner>) => {
    const { error } = await supabase.from("hero_banners").update(data).eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    queryClient.invalidateQueries({ queryKey: ["active-banners"] });
    return true;
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    queryClient.invalidateQueries({ queryKey: ["active-banners"] });
    return true;
  };

  return { banners, isLoading, createBanner, updateBanner, deleteBanner };
};

// Hook for active banners (customer-facing)
export const useActiveBanners = () => {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HeroBanner[];
    },
  });

  return { banners, isLoading };
};

// Hook for user notifications
export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
  };

  return { notifications, isLoading, unreadCount, markAsRead, markAllAsRead };
};

// Hook for voucher validation at checkout
export const useVoucherValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const validateVoucher = async (code: string, orderTotal: number) => {
    if (!user) {
      toast({ title: "Error", description: "Please login to use vouchers", variant: "destructive" });
      return null;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc("validate_voucher", {
        p_code: code,
        p_user_id: user.id,
        p_order_total: orderTotal,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.valid) {
        toast({ title: "Invalid Voucher", description: result?.message || "Voucher not valid", variant: "destructive" });
        return null;
      }

      toast({ title: "Voucher Applied!", description: result.message });
      return {
        discountAmount: result.discount_amount,
        message: result.message,
      };
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const recordVoucherUsage = async (code: string, orderId: string) => {
    if (!user) return;

    // Get voucher ID and current used_count
    const { data: voucher } = await supabase
      .from("vouchers")
      .select("id, used_count")
      .ilike("code", code)
      .single();

    if (voucher) {
      // Record usage
      await supabase.from("voucher_usage").insert([{
        voucher_id: voucher.id,
        user_id: user.id,
        order_id: orderId,
      }]);

      // Increment used_count
      await supabase
        .from("vouchers")
        .update({ used_count: (voucher.used_count || 0) + 1 })
        .eq("id", voucher.id);

      // Mark collected voucher as used if applicable
      await supabase
        .from("collected_vouchers")
        .update({ used_at: new Date().toISOString() })
        .eq("voucher_id", voucher.id)
        .eq("user_id", user.id);
    }
  };

  return { validateVoucher, recordVoucherUsage, isValidating };
};

// Hook for recently viewed / Just For You
export const useRecentlyViewed = () => {
  const { user } = useAuth();

  const trackView = async (productId: string, category: string) => {
    if (!user) return;

    try {
      await supabase
        .from("user_recently_viewed")
        .upsert(
          {
            user_id: user.id,
            product_id: productId,
            category,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,product_id" }
        );
    } catch {
      // Silently fail
    }
  };

  const { data: recentCategories = [] } = useQuery({
    queryKey: ["recent-categories", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_recently_viewed")
        .select("category")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(10);

      if (error) return [];
      
      // Get unique categories
      const categories = [...new Set(data.map((d) => d.category))];
      return categories.slice(0, 5);
    },
    enabled: !!user,
  });

  return { trackView, recentCategories };
};
