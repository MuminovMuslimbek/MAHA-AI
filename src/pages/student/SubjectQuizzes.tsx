
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import QuizCard from '@/components/common/QuizCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Trophy, Target, Clock, BookOpen } from 'lucide-react';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';

const SubjectQuizzes: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { results } = useQuizResults();
  const { subjects } = useSubjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const currentSubject = subjects.find(s => s.id === subjectId);

  const subjectQuizzes = useMemo(() => {
    return quizzes.filter(quiz => quiz.subject_id === subjectId);
  }, [quizzes, subjectId]);

  // Filter quizzes based on search and tab
  const filteredQuizzes = useMemo(() => {
    let filtered = subjectQuizzes;

    // Apply search filter with proper type checking
    if (searchTerm) {
      filtered = filtered.filter(quiz => {
        const title = quiz.title || '';
        const description = quiz.description || '';
        const searchLower = searchTerm.toLowerCase();
        return title.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower);
      });
    }

    const completedQuizIds = results
      .filter(result => result.user_id === user?.id)
      .map(result => result.quiz_id);

    switch (activeTab) {
      case 'available':
        return filtered.filter(quiz => !completedQuizIds.includes(quiz.id));
      case 'completed':
        return filtered.filter(quiz => completedQuizIds.includes(quiz.id));
      case 'premium':
        return filtered.filter(quiz => quiz.is_premium);
      default:
        return filtered;
    }
  }, [subjectQuizzes, searchTerm, activeTab, results, user?.id]);

  const stats = useMemo(() => {
    const completedQuizIds = results
      .filter(result => result.user_id === user?.id)
      .map(result => result.quiz_id);

    const completed = subjectQuizzes.filter(quiz => 
      completedQuizIds.includes(quiz.id)
    ).length;

    const available = subjectQuizzes.filter(quiz => 
      !completedQuizIds.includes(quiz.id)
    ).length;

    const premium = subjectQuizzes.filter(quiz => quiz.is_premium).length;

    return { total: subjectQuizzes.length, completed, available, premium };
  }, [subjectQuizzes, results, user?.id]);

  const getResultForQuiz = (quizId: string) => {
    return results.find(result => 
      result.quiz_id === quizId && result.user_id === user?.id
    );
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{currentSubject?.name || 'Subject'} Quizzes</h1>
              <p className="text-white/90 text-lg">Master your knowledge with interactive quizzes</p>
            </div>
          <div className="hidden md:block">
            <BookOpen className="h-16 w-16 text-white/80" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-white/80">Total Quizzes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm text-white/80">Completed</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{stats.available}</div>
            <div className="text-sm text-white/80">Available</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Badge className="h-6 w-6 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{stats.premium}</div>
            <div className="text-sm text-white/80">Premium</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white shadow-lg border-0 rounded-xl"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger 
            value="all" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger 
            value="available"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            Available ({stats.available})
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger 
            value="premium"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            Premium ({stats.premium})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {quizzesLoading ? (
            <div className="text-center py-12">Loading quizzes...</div>
          ) : filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const result = getResultForQuiz(quiz.id);
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    linkTo={`/quizzes/${quiz.id}`}
                    isCompleted={!!result}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No quizzes found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No quizzes match "${searchTerm}" in the ${activeTab} category.`
                    : `No ${activeTab} quizzes available for ${currentSubject?.name || 'this subject'}.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default SubjectQuizzes;
