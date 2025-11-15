import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  name: string;
  class_id: string | null;
  created_at: string;
}

export const useSubjects = () => {
  const queryClient = useQueryClient();

  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subject[];
    },
  });

  const createSubject = useMutation({
    mutationFn: async ({ name, classId }: { name: string; classId: string }) => {
      const { error } = await supabase
        .from('subjects')
        .insert([{ name, class_id: classId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, name, classId }: { id: string; name: string; classId: string }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ name, class_id: classId })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return {
    subjects: subjects ?? [],
    isLoading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};
