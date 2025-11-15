import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string | null;
  placement: 'quiz' | 'dashboard' | 'results' | 'current_affairs';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdvertisements = (placement?: string) => {
  const { data: advertisements, isLoading, error } = useQuery({
    queryKey: placement ? ['advertisements', placement] : ['advertisements'],
    queryFn: async () => {
      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (placement) {
        query = query.eq('placement', placement);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Advertisement[];
    },
  });

  return {
    advertisements: advertisements ?? [],
    isLoading,
    error,
  };
};
