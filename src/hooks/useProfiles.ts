import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  tokens: number;
  last_coin_claim: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      return data as ProfileData[];
    },
  });

  return {
    profiles: profiles ?? [],
    isLoading,
    error,
  };
};
