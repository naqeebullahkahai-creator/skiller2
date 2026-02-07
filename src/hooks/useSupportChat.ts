import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupportSession {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: string;
  subject: string | null;
  rating: number | null;
  rating_comment: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatShortcut {
  id: string;
  label: string;
  message: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

// Hook to get chat shortcuts
export const useChatShortcuts = () => {
  const { data: shortcuts = [], isLoading } = useQuery({
    queryKey: ['chat-shortcuts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_shortcuts')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as ChatShortcut[];
    },
  });
  return { shortcuts, isLoading };
};

// Hook to manage chat shortcuts (admin)
export const useManageChatShortcuts = () => {
  const queryClient = useQueryClient();

  const { data: shortcuts = [], isLoading } = useQuery({
    queryKey: ['chat-shortcuts-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_shortcuts')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as ChatShortcut[];
    },
  });

  const addShortcut = useMutation({
    mutationFn: async (shortcut: { label: string; message: string; category: string }) => {
      const maxOrder = shortcuts.length > 0 ? Math.max(...shortcuts.map(s => s.display_order)) + 1 : 1;
      const { error } = await supabase
        .from('chat_shortcuts')
        .insert({ ...shortcut, display_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts'] });
      toast.success('Shortcut added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateShortcut = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChatShortcut> & { id: string }) => {
      const { error } = await supabase
        .from('chat_shortcuts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts'] });
      toast.success('Shortcut updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteShortcut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chat_shortcuts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['chat-shortcuts'] });
      toast.success('Shortcut deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { shortcuts, isLoading, addShortcut, updateShortcut, deleteShortcut };
};

// Hook to create a support session and send messages
export const useSupportSession = () => {
  const [session, setSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Create a new support session
  const createSession = useCallback(async (subject?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check for existing active session
      const { data: existing } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'active'])
        .limit(1)
        .single();

      if (existing) {
        setSession(existing as SupportSession);
        // Load messages
        const { data: msgs } = await supabase
          .from('support_messages')
          .select('*')
          .eq('session_id', existing.id)
          .order('created_at');
        setMessages((msgs || []) as SupportMessage[]);
        return existing as SupportSession;
      }

      const { data, error } = await supabase
        .from('support_chat_sessions')
        .insert({ user_id: user.id, subject })
        .select()
        .single();

      if (error) throw error;
      setSession(data as SupportSession);
      return data as SupportSession;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start chat');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!session) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('support_messages')
      .insert({ session_id: session.id, sender_id: user.id, content });
    if (error) toast.error('Failed to send message');
  }, [session]);

  // End the session
  const endSession = useCallback(async () => {
    if (!session) return;
    await supabase
      .from('support_chat_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', session.id);
    setSession(null);
    setMessages([]);
  }, [session]);

  // Rate the session
  const rateSession = useCallback(async (rating: number, feedbackText?: string) => {
    if (!session) return;
    await supabase
      .from('support_chat_sessions')
      .update({ rating, rating_comment: feedbackText || null, feedback_text: feedbackText || null })
      .eq('id', session.id);
    toast.success('Thank you for your feedback!');
  }, [session]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`support-messages-${session.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `session_id=eq.${session.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SupportMessage]);
      })
      .subscribe();

    // Also subscribe to session status changes
    const sessionChannel = supabase
      .channel(`support-session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_chat_sessions',
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        setSession(payload.new as SupportSession);
        if (payload.new.status === 'active' && payload.old?.status === 'waiting') {
          toast.success('An agent has joined your chat!');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session?.id]);

  return { session, messages, loading, createSession, sendMessage, endSession, rateSession };
};

// Hook for support agents to manage their queue
export const useAgentQueue = () => {
  const queryClient = useQueryClient();

  const { data: waitingSessions = [], isLoading } = useQuery({
    queryKey: ['agent-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at');
      if (error) throw error;
      return data as SupportSession[];
    },
    refetchInterval: 5000,
  });

  const acceptSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_chat_sessions')
        .update({ agent_id: user.id, status: 'active', started_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('status', 'waiting');
      if (error) throw error;

      // Send system message
      await supabase.from('support_messages').insert({
        session_id: sessionId,
        sender_id: user.id,
        content: `You are now chatting with FANZON Support. How can I help you?`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-queue'] });
      toast.success('Chat accepted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { waitingSessions, isLoading, acceptSession };
};

// Hook for agents to manage their online status
export const useAgentOnlineStatus = () => {
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goOnline = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('agent_online_status')
      .upsert({ user_id: user.id, is_online: true, last_seen_at: new Date().toISOString() }, { onConflict: 'user_id' });

    // Heartbeat every 30s
    heartbeatRef.current = setInterval(async () => {
      await supabase
        .from('agent_online_status')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }, 30000);
  }, []);

  const goOffline = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    await supabase
      .from('agent_online_status')
      .update({ is_online: false })
      .eq('user_id', user.id);
  }, []);

  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  return { goOnline, goOffline };
};
