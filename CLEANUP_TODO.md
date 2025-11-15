# Code Cleanup TODO

This file tracks remaining cleanup tasks for migrating from mock data to Supabase.

## Completed ✅
- ✅ Created Supabase hooks: useQuizzes, useExams, useCurrentAffairs, useQuizResults, useProfiles
- ✅ Updated admin Dashboard to use Supabase hooks
- ✅ Removed mockData.ts (no longer needed)
- ✅ Updated MainLayout to use AuthContext and useUserRole
- ✅ Updated BottomNav to use useUserRole
- ✅ Updated NotFound to use useUserRole

## Still Using AppContext (Need Migration)

### High Priority - Core Student Features
1. **src/pages/student/Dashboard.tsx** - Student dashboard (uses quizzes, exams, currentAffairs, results)
2. **src/pages/student/Quizzes.tsx** - Quiz listing page
3. **src/pages/student/QuizAttempt.tsx** - Quiz taking interface
4. **src/pages/student/ExamAttempt.tsx** - Exam taking interface
5. **src/pages/student/Exams.tsx** - Exam listing
6. **src/pages/student/Profile.tsx** - User profile page

### Medium Priority - Content Pages
7. **src/pages/student/CurrentAffairs.tsx** - Current affairs listing
8. **src/pages/student/CurrentAffairDetail.tsx** - Current affair detail view
9. **src/pages/student/SubjectList.tsx** - Subject-based quiz filtering
10. **src/pages/student/SubjectQuizzes.tsx** - Quizzes by subject

### Medium Priority - Admin Pages
11. **src/pages/admin/Quizzes.tsx** - Admin quiz management
12. **src/pages/admin/QuizForm.tsx** - Quiz creation/editing
13. **src/pages/admin/QuizImport.tsx** - Bulk quiz import
14. **src/pages/admin/CurrentAffairs.tsx** - Admin current affairs management
15. **src/pages/admin/CurrentAffairForm.tsx** - Current affair form
16. **src/pages/admin/UpcomingExams.tsx** - Exam management
17. **src/pages/admin/ExamForm.tsx** - Exam creation/editing
18. **src/pages/admin/ClassManagement.tsx** - Class management
19. **src/pages/admin/SubjectManagement.tsx** - Subject management
20. **src/pages/admin/StudentManagement.tsx** - Student management
21. **src/pages/admin/TokenRecharge.tsx** - Token recharge management
22. **src/pages/admin/AdvertisementManagement.tsx** - Ad management

### Low Priority - Components
23. **src/components/common/CurrentAffairCard.tsx** - Uses consumeTokens
24. **src/components/common/DailyCoinsCard.tsx** - Uses claimDailyCoins, canClaimDailyCoins
25. **src/components/common/LockContent.tsx** - Uses consumeTokens
26. **src/components/quiz/QuizResult.tsx** - Uses results, quizzes
27. **src/components/student/Onboarding.tsx** - Uses currentUser

## Migration Strategy

### For each file:
1. Replace `useApp()` with appropriate Supabase hooks
2. Update data access patterns (e.g., `quizzes` → `quizzes` from `useQuizzes()`)
3. Replace local state mutations with Supabase mutations
4. Update create/update/delete functions to use Supabase
5. Handle loading and error states properly
6. Test functionality to ensure exact same behavior

### Example Pattern:
```typescript
// OLD
import { useApp } from '@/contexts/AppContext';
const { quizzes, createQuiz } = useApp();

// NEW
import { useQuizzes } from '@/hooks/useQuizzes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { quizzes, isLoading } = useQuizzes();
const queryClient = useQueryClient();

const createQuizMutation = useMutation({
  mutationFn: async (newQuiz) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([newQuiz])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['quizzes'] });
  },
});
```

## After Migration Complete
- [ ] Remove AppContext.tsx entirely
- [ ] Remove AppProvider from App.tsx
- [ ] Update all TypeScript types to match Supabase schema
- [ ] Add proper error boundaries
- [ ] Add loading states throughout app
- [ ] Verify all RLS policies are working correctly
