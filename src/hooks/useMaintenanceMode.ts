import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMaintenanceMode = () => {
  const queryClient = useQueryClient();

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
      return data;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle maintenance mode: ${error.message}`);
    },
  });

  return {
    isMaintenanceMode: isMaintenanceMode ?? false,
    isLoading,
    toggleMaintenanceMode,
  };
};
