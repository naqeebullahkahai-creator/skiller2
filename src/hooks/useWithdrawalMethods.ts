import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WithdrawalMethodField {
  field_name: string;
  field_label: string;
  is_required: boolean;
}

export interface WithdrawalMethod {
  id: string;
  name: string;
  is_active: boolean;
  fields: WithdrawalMethodField[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useWithdrawalMethods = () => {
  const queryClient = useQueryClient();

  const { data: methods, isLoading } = useQuery({
    queryKey: ['withdrawal-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_methods' as any)
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        fields: typeof m.fields === 'string' ? JSON.parse(m.fields) : m.fields,
      })) as WithdrawalMethod[];
    },
  });

  const activeMethods = methods?.filter(m => m.is_active) || [];

  const createMethod = useMutation({
    mutationFn: async (method: { name: string; fields: WithdrawalMethodField[] }) => {
      const { data, error } = await supabase
        .from('withdrawal_methods' as any)
        .insert({ name: method.name, fields: method.fields as any, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Withdrawal method created');
      queryClient.invalidateQueries({ queryKey: ['withdrawal-methods'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMethod = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WithdrawalMethod> & { id: string }) => {
      const { error } = await supabase
        .from('withdrawal_methods' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Method updated');
      queryClient.invalidateQueries({ queryKey: ['withdrawal-methods'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMethod = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('withdrawal_methods' as any)
        .update({ is_active, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-methods'] });
    },
  });

  const deleteMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('withdrawal_methods' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Method deleted');
      queryClient.invalidateQueries({ queryKey: ['withdrawal-methods'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { methods: methods || [], activeMethods, isLoading, createMethod, updateMethod, toggleMethod, deleteMethod };
};
