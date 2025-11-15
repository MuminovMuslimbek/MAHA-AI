import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Label {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export const useLabels = () => {
  const { data: labels, isLoading, error } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Label[];
    },
  });

  return {
    labels: labels ?? [],
    isLoading,
    error,
  };
};
