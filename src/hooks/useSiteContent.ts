import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteContent {
  id: string;
  page: string;
  section_key: string;
  title: string | null;
  content: string;
  content_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSiteContent = (page?: string) => {
  const { data: contentList = [], isLoading } = useQuery({
    queryKey: ['site-content', page],
    queryFn: async () => {
      let query = supabase.from('site_content').select('*').order('page').order('section_key');
      if (page) query = query.eq('page', page);
      const { data, error } = await query;
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  const getContent = (sectionKey: string): string => {
    return contentList.find(c => c.section_key === sectionKey)?.content || '';
  };

  return { contentList, isLoading, getContent };
};

export const useManageSiteContent = () => {
  const queryClient = useQueryClient();

  const { data: contentList = [], isLoading } = useQuery({
    queryKey: ['site-content-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('page')
        .order('section_key');
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, content, title }: { id: string; content: string; title?: string }) => {
      const updates: Record<string, any> = { content };
      if (title !== undefined) updates.title = title;
      const { error } = await supabase.from('site_content').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content-admin'] });
      toast.success('Content updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addContent = useMutation({
    mutationFn: async (item: { page: string; section_key: string; title: string; content: string }) => {
      const { error } = await supabase.from('site_content').insert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content-admin'] });
      toast.success('Content block added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('site_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content-admin'] });
      toast.success('Content block deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { contentList, isLoading, updateContent, addContent, deleteContent };
};
