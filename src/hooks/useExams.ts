import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  duration: number;
  subject_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useExams = () => {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as Exam[];
    },
  });

  return {
    exams: exams ?? [],
    isLoading,
    error,
  };
};
