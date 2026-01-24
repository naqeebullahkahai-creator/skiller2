import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  is_enabled: boolean;
  setting_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      isEnabled 
    }: { 
      key: string; 
      value?: string; 
      isEnabled?: boolean;
    }) => {
      const updateData: Record<string, any> = {};
      if (value !== undefined) updateData.setting_value = value;
      if (isEnabled !== undefined) updateData.is_enabled = isEnabled;

      const { data, error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('setting_key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  // Helper to get a specific setting
  const getSetting = (key: string): SiteSetting | undefined => {
    return settings?.find(s => s.setting_key === key);
  };

  // Helper to get enabled social links
  const getSocialLinks = () => {
    return settings?.filter(s => 
      s.setting_key.startsWith('social_') && s.is_enabled
    ) || [];
  };

  // Helper to get contact info
  const getContactInfo = () => {
    return settings?.filter(s => 
      s.setting_key.startsWith('contact_') && s.is_enabled
    ) || [];
  };

  return {
    settings,
    isLoading,
    updateSetting,
    getSetting,
    getSocialLinks,
    getContactInfo,
  };
};
