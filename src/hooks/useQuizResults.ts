import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QuizResult {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_spent: number;
  answers: any;
  completed_at: string;
}

export const useQuizResults = () => {
  const { user } = useAuth();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['quizResults', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as QuizResult[];
    },
    enabled: !!user,
  });

  return {
    results: results ?? [],
    isLoading,
    error,
  };
};
