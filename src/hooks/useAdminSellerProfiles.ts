import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SellerProfile } from './useSellerKyc';

export const useAdminSellerProfiles = () => {
  const queryClient = useQueryClient();

  const { data: sellerProfiles, isLoading } = useQuery({
    queryKey: ['admin-seller-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as SellerProfile[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      rejectionReason 
    }: { 
      id: string; 
      status: 'verified' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      const updateData: Record<string, any> = {
        verification_status: status,
      };

      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
        updateData.rejection_reason = null;
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason || 'Application rejected';
      }

      const { data, error } = await supabase
        .from('seller_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Seller ${variables.status === 'verified' ? 'approved' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-seller-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const pendingCount = sellerProfiles?.filter(s => s.verification_status === 'pending').length || 0;
  const verifiedCount = sellerProfiles?.filter(s => s.verification_status === 'verified').length || 0;
  const rejectedCount = sellerProfiles?.filter(s => s.verification_status === 'rejected').length || 0;

  return {
    sellerProfiles,
    isLoading,
    updateStatus,
    pendingCount,
    verifiedCount,
    rejectedCount,
  };
};
