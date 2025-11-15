import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CurrentAffair {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  image_url: string | null;
  is_premium: boolean;
  token_price: number;
  published_date: string;
  created_at: string;
  metadata: any;
}

export const useCurrentAffairs = () => {
  const { data: currentAffairs, isLoading, error } = useQuery({
    queryKey: ['currentAffairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_affairs')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      return data as CurrentAffair[];
    },
  });

  return {
    currentAffairs: currentAffairs ?? [],
    isLoading,
    error,
  };
};
