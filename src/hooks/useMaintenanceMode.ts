import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceConfig {
  isEnabled: boolean;
  endTime: string | null;
  allowedRoles: string[];
  message: string;
}

export const useMaintenanceMode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'maintenance_mode',
          'maintenance_end_time',
          'maintenance_allowed_roles',
          'maintenance_message',
        ]);

      if (error) throw error;

      const map: Record<string, string> = {};
      data?.forEach((d) => {
        map[d.setting_key] = d.setting_value;
      });

      return {
        isEnabled: map['maintenance_mode'] === 'true',
        endTime: map['maintenance_end_time'] || null,
        allowedRoles: (map['maintenance_allowed_roles'] || 'admin').split(',').map(r => r.trim()),
        message: map['maintenance_message'] || 'We are currently updating the store for a better experience.',
      } as MaintenanceConfig;
    },
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000,
  });

  const toggleMaintenanceMode = useMutation({
    mutationFn: async ({ enabled, endTime, allowedRoles, message }: {
      enabled: boolean;
      endTime?: string;
      allowedRoles?: string[];
      message?: string;
    }) => {
      const updates = [
        supabase.from('admin_settings').update({ setting_value: enabled ? 'true' : 'false' }).eq('setting_key', 'maintenance_mode'),
      ];

      if (endTime !== undefined) {
        updates.push(
          supabase.from('admin_settings').update({ setting_value: endTime }).eq('setting_key', 'maintenance_end_time')
        );
      }
      if (allowedRoles !== undefined) {
        updates.push(
          supabase.from('admin_settings').update({ setting_value: allowedRoles.join(',') }).eq('setting_key', 'maintenance_allowed_roles')
        );
      }
      if (message !== undefined) {
        updates.push(
          supabase.from('admin_settings').update({ setting_value: message }).eq('setting_key', 'maintenance_message')
        );
      }

      await Promise.all(updates);
      return { enabled };
    },
    onSuccess: ({ enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      toast({
        title: enabled ? "🔧 Maintenance Mode ENABLED" : "✅ Maintenance Mode DISABLED",
        description: enabled
          ? "All restricted users are now being redirected to the maintenance page."
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
    isMaintenanceMode: data?.isEnabled ?? false,
    maintenanceConfig: data ?? { isEnabled: false, endTime: null, allowedRoles: ['admin'], message: '' },
    isLoading,
    toggleMaintenanceMode,
  };
};
