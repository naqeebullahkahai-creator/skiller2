import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceMode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isMaintenanceMode, isLoading } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value === 'true';
    },
    staleTime: 30 * 1000, // Refresh every 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh
  });

  const toggleMaintenanceMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ setting_value: enabled ? 'true' : 'false' })
        .eq('setting_key', 'maintenance_mode')
        .select()
        .single();

      if (error) throw error;
      return { data, enabled };
    },
    onSuccess: ({ enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      
      // Show prominent toast notification
      toast({
        title: enabled ? "🔧 Maintenance Mode ENABLED" : "✅ Maintenance Mode DISABLED",
        description: enabled 
          ? "All non-admin users are now being redirected to the maintenance page. The storefront is offline."
          : "The storefront is now live. All users can access the platform.",
        variant: enabled ? "destructive" : "default",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Toggle Maintenance Mode",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isMaintenanceMode: isMaintenanceMode ?? false,
    isLoading,
    toggleMaintenanceMode,
  };
};
