import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SellerSavedWallet {
  id: string;
  seller_id: string;
  method_id: string;
  label: string;
  field_values: Record<string, string>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useSellerSavedWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedWallets, isLoading } = useQuery({
    queryKey: ['seller-saved-wallets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('seller_saved_wallets' as any)
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SellerSavedWallet[];
    },
    enabled: !!user?.id,
  });

  const saveWallet = useMutation({
    mutationFn: async (wallet: { method_id: string; label: string; field_values: Record<string, string>; is_default?: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // If setting as default, unset others
      if (wallet.is_default) {
        await supabase
          .from('seller_saved_wallets' as any)
          .update({ is_default: false } as any)
          .eq('seller_id', user.id);
      }
      
      const { data, error } = await supabase
        .from('seller_saved_wallets' as any)
        .insert({
          seller_id: user.id,
          method_id: wallet.method_id,
          label: wallet.label,
          field_values: wallet.field_values as any,
          is_default: wallet.is_default || false,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Wallet saved successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-saved-wallets', user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateWallet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SellerSavedWallet> & { id: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('seller_saved_wallets' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .eq('seller_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Wallet updated');
      queryClient.invalidateQueries({ queryKey: ['seller-saved-wallets', user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('seller_saved_wallets' as any)
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Wallet removed');
      queryClient.invalidateQueries({ queryKey: ['seller-saved-wallets', user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { savedWallets: savedWallets || [], isLoading, saveWallet, updateWallet, deleteWallet };
};
