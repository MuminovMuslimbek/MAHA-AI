
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useQuizResults } from '@/hooks/useQuizResults';
import MainLayout from '@/layouts/MainLayout';
import QuizCard from '@/components/common/QuizCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight, BookOpen, CheckCircle, Clock } from 'lucide-react';

const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const { quizzes, isLoading } = useQuizzes();
  const { results } = useQuizResults();
  const [search, setSearch] = useState('');
  
  // Filter quizzes based on search term
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(search.toLowerCase()) || 
    (quiz.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (quiz.category || '').toLowerCase().includes(search.toLowerCase())
  );
  
  // Get completed quizzes
  const completedQuizIds = results
    .filter(result => result.user_id === user?.id)
    .map(result => result.quiz_id);
  
  const completedQuizzes = filteredQuizzes.filter(quiz => 
    completedQuizIds.includes(quiz.id)
  );
  
  const availableQuizzes = filteredQuizzes.filter(quiz => 
    !completedQuizIds.includes(quiz.id)
  );

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-2xl p-6 shadow-2xl transform hover:scale-102 transition-all duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl animate-bounce">🧠</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">All Quizzes ⚡</h1>
          </div>
          <p className="text-white/90 text-sm md:text-base flex items-center">
            <span className="text-xl mr-2">🎯</span>
            Practice and test your knowledge with our amazing collection of quizzes
          </p>
        </div>
      </div>

      {/* New Class Selection CTA with Enhanced Design */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-600 rounded-2xl p-5 text-white mb-6 shadow-2xl animate-fade-in transform hover:scale-102 transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="text-3xl animate-bounce">📚</div>
            <div>
              <h3 className="font-bold text-lg mb-2 flex items-center">
                Browse by Class & Subject ✨
              </h3>
              <p className="mb-3 md:mb-0 text-sm text-white/90 flex items-center">
                <span className="mr-2">🔍</span>
                Find quizzes organized by class and subject for better learning
              </p>
            </div>
          </div>
          <Button 
            asChild 
            variant="secondary" 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white hover:scale-105 transition-all duration-300 shadow-lg mt-3 md:mt-0"
          >
            <Link to="/classes" className="flex items-center">
              <span className="mr-2">🚀</span>
              Browse Classes 
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative mb-6 max-w-md mx-auto animate-fade-in">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="🔍 Search quizzes by title, description or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-purple-200 focus-visible:ring-purple-500 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300"
        />
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-2xl animate-fade-in transform hover:scale-102 transition-all duration-500">
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3 mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <span className="mr-1">📚</span>
              <BookOpen className="h-4 w-4 mr-1 inline" /> 
              All ({filteredQuizzes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="available" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <span className="mr-1">⏰</span>
              <Clock className="h-4 w-4 mr-1 inline" /> 
              Available ({availableQuizzes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <span className="mr-1">✅</span>
              <CheckCircle className="h-4 w-4 mr-1 inline" /> 
              Completed ({completedQuizzes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-2">
            {isLoading ? (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4 animate-spin">⏳</div>
                <p className="text-slate-500 font-medium">Loading quizzes...</p>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 text-center animate-bounce">
                <div className="text-6xl mb-4">📚</div>
                <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 font-medium">No quizzes found! 🔍</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredQuizzes.map((quiz, index) => (
                  <div key={quiz.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <QuizCard 
                      quiz={quiz} 
                      linkTo={`/quizzes/${quiz.id}`}
                      isCompleted={completedQuizIds.includes(quiz.id)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="pt-2">
            {availableQuizzes.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-8 text-center animate-bounce">
                <div className="text-6xl mb-4">⏰</div>
                <Clock className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                <p className="text-blue-500 font-medium">No available quizzes found! 🎯</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableQuizzes.map((quiz, index) => (
                  <div key={quiz.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <QuizCard 
                      quiz={quiz} 
                      linkTo={`/quizzes/${quiz.id}`} 
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="pt-2">
            {completedQuizzes.length === 0 ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center animate-bounce">
                <div className="text-6xl mb-4">🏆</div>
                <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-3" />
                <p className="text-green-500 font-medium">No completed quizzes yet! Start your first quiz ✨</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {completedQuizzes.map((quiz, index) => (
                  <div key={quiz.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <QuizCard 
                      quiz={quiz} 
                      linkTo={`/quiz-results/${quiz.id}`} 
                      isCompleted={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Quizzes;
