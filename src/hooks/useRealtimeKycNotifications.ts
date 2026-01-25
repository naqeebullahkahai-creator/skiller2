import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeKycNotifications = () => {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only subscribe for super admins
    if (!isSuperAdmin) return;

    const channel = supabase
      .channel('admin-kyc-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'seller_profiles',
        },
        (payload) => {
          // New seller profile created
          const newSeller = payload.new as any;
          
          if (newSeller.verification_status === 'pending') {
            toast.info("New Seller KYC Submission", {
              description: `${newSeller.shop_name || 'A new seller'} has submitted their KYC documents for review.`,
              action: {
                label: "Review",
                onClick: () => {
                  window.location.href = `/admin/seller-kyc/${newSeller.id}`;
                },
              },
              duration: 10000,
            });
            
            // Invalidate seller queries
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-seller-profiles'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seller_profiles',
        },
        (payload) => {
          const oldData = payload.old as any;
          const newData = payload.new as any;
          
          // Check if status changed to pending (resubmission)
          if (oldData.verification_status !== 'pending' && newData.verification_status === 'pending') {
            toast.info("KYC Resubmission", {
              description: `${newData.shop_name || 'A seller'} has resubmitted their KYC documents.`,
              action: {
                label: "Review",
                onClick: () => {
                  window.location.href = `/admin/seller-kyc/${newData.id}`;
                },
              },
              duration: 10000,
            });
            
            // Invalidate seller queries
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-seller-profiles'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, queryClient]);
};
