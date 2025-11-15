import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  time_limit: number;
  is_premium: boolean;
  subject_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useQuizzes = () => {
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    },
  });

  const deleteQuiz = useMutation({
    mutationFn: async (quizId: string) => {
      // First delete associated questions
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      // Then delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  return {
    quizzes: quizzes ?? [],
    isLoading,
    error,
    deleteQuiz,
  };
};
