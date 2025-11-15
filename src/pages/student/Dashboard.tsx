
import React, { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import DashboardStats from '@/components/common/DashboardStats';
import QuizCard from '@/components/common/QuizCard';
import ExamCard from '@/components/common/ExamCard';
import CurrentAffairCard from '@/components/common/CurrentAffairCard';
import DailyCoinsCard from '@/components/common/DailyCoinsCard';
import Onboarding from '@/components/student/Onboarding';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, Target, Award, Smile, Sparkles, Lightbulb, Coins, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import TokenDisplay from '@/components/common/TokenDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isToday, isYesterday } from 'date-fns';

const Dashboard: React.FC = () => {
  const { currentUser, quizzes, exams, currentAffairs, results } = useApp();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [affairsDateFilter, setAffairsDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const isMobile = useIsMobile();
  
  // Check for first-time users
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);
  
  // Calculate stats for dashboard
  const stats = useMemo(() => {
    // Filter results for current user
    const userResults = results.filter(result => result.userId === currentUser?.id);
    
    // Calculate average score
    const totalScore = userResults.reduce((acc, result) => acc + (result.score / result.totalQuestions) * 100, 0);
    const averageScore = userResults.length > 0 ? Math.round(totalScore / userResults.length) : 0;
    
    // Count upcoming exams (current date is before end date)
    const upcomingExams = exams.filter(exam => new Date() <= exam.endDate).length;
    
    return {
      quizzes: quizzes.length,
      completedQuizzes: userResults.length,
      averageScore,
      upcomingExams,
    };
  }, [currentUser, quizzes, exams, results]);

  // Calculate earned badges
  const badges = useMemo(() => {
    if (!currentUser) return { bronze: 0, silver: 0, gold: 0 };
    
    const userResults = results.filter(result => result.userId === currentUser.id);
    
    // Count badges based on score percentages
    const badgeCounts = userResults.reduce((acc, result) => {
      const percentage = (result.score / result.totalQuestions) * 100;
      if (percentage >= 90) acc.gold += 1;
      else if (percentage >= 75) acc.silver += 1;
      else if (percentage >= 50) acc.bronze += 1;
      return acc;
    }, { bronze: 0, silver: 0, gold: 0 });
    
    return badgeCounts;
  }, [currentUser, results]);

  // Get most recent quizzes, exams, and current affairs with date filtering
  const recentQuizzes = [...quizzes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, isMobile ? 2 : 4);
  const upcomingExams = exams.filter(exam => new Date() <= exam.endDate).slice(0, 2);
  
  const filteredCurrentAffairs = currentAffairs.filter(affair => {
    const affairDate = new Date(affair.publishedDate);
    if (affairsDateFilter === 'today') return isToday(affairDate);
    if (affairsDateFilter === 'yesterday') return isYesterday(affairDate);
    return true;
  });
  
  const recentCurrentAffairs = [...filteredCurrentAffairs]
    .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
    .slice(0, isMobile ? 3 : 6);

  if (showOnboarding) {
    return <Onboarding />;
  }

  return (
    <MainLayout>
      {/* Welcome Header with Modern Design */}
      <div className="mb-4 ">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-2xl transform  transition-all duration-500 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl ">👋</div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Welcome back, {currentUser?.name}! 🌟
            </h1>
          </div>
          <p className="text-white/90 text-sm md:text-base mb-3">
            {!isMobile ? "🚀 Ready to continue your amazing learning journey?" : "📚 Let's learn something exciting today!"}
          </p>
          
          {/* Display tokens prominently with animation */}
          <div className="flex justify-between items-center">
            <TokenDisplay showAddButton={false} />
            <div className="flex gap-2 text-2xl ">
              <span>⭐</span>
              <span>🎯</span>
              <span>🏆</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 pb-16 md:pb-0">
        {/* Daily Coins and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="md:col-span-2 space-y-3 md:space-y-4">
            {/* Stats */}
            <DashboardStats stats={stats} userType="student" />
          </div>
          
          <div className="md:col-span-1 transform transition-all duration-300">
            <DailyCoinsCard />
          </div>
        </div>
        
        {/* Badges Section with Emojis */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-4 shadow-2xl text-white transform  transition-all duration-500 ">
          <h3 className="font-bold text-base md:text-lg mb-3 flex items-center">
            <div className="text-2xl mr-2 ">🏆</div>
            <Sparkles className="mr-2 h-5 w-5 text-yellow-300 " />
            Your Epic Achievements
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {badges.bronze > 0 && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 shadow-lg  transition-all duration-300 ">
                <span className="text-lg mr-1">🥉</span>
                <Award className="h-4 w-4 mr-1" /> 
                {badges.bronze} Bronze
              </Badge>
            )}
            {badges.silver > 0 && (
              <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-2 shadow-lg  transition-all duration-300 ">
                <span className="text-lg mr-1">🥈</span>
                <Award className="h-4 w-4 mr-1" /> 
                {badges.silver} Silver
              </Badge>
            )}
            {badges.gold > 0 && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-2 shadow-lg  transition-all duration-300 ">
                <span className="text-lg mr-1">🥇</span>
                <Award className="h-4 w-4 mr-1" /> 
                {badges.gold} Gold
              </Badge>
            )}
            {badges.bronze === 0 && badges.silver === 0 && badges.gold === 0 && (
              <div className="flex items-center text-white/90 ">
                <span className="text-xl mr-2">🎯</span>
                <p className="text-sm">Complete quizzes to earn your first shiny badge! ✨</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Learning Paths Section with Modern Design */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-4 shadow-2xl text-white transform  transition-all duration-500 ">
          <h3 className="font-bold text-base md:text-lg mb-2 flex items-center">
            <span className="text-2xl mr-2 ">🎯</span>
            <Target className="mr-2 h-5 w-5" />
            Choose Your Learning Adventure
          </h3>
          <p className="mb-3 text-sm text-white/90 flex items-center">
            <span className="text-lg mr-2">🚀</span>
            Pick your path to academic excellence and fun learning!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/classes"
              className="flex flex-col items-center p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white/30  transition-all duration-300 group"
            >
              <div className="text-2xl mb-2 group-hover:">📚</div>
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-white mb-2 group-hover:" />
              <span className="text-sm md:text-base font-medium">By Class</span>
            </Link>
            <Link 
              to="/quizzes"
              className="flex flex-col items-center p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white/30  transition-all duration-300 group"
            >
              <div className="text-2xl mb-2 group-hover:">🧠</div>
              <Award className="h-6 w-6 md:h-8 md:w-8 text-white mb-2 group-hover:" />
              <span className="text-sm md:text-base font-medium">All Quizzes</span>
            </Link>
          </div>
        </div>
        
        {/* Recent Quizzes with Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0 transform  transition-all duration-500 ">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2 ">📖</span>
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Latest Quizzes ✨
              </h2>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white  transition-all duration-300">
                <Link to="/quizzes" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {recentQuizzes.map((quiz, index) => (
                <div key={quiz.id} className="" style={{ animationDelay: `${index * 100}ms` }}>
                  <QuizCard 
                    quiz={quiz} 
                    linkTo={`/quizzes/${quiz.id}`} 
                  />
                </div>
              ))}
              {recentQuizzes.length === 0 && (
                <div className="col-span-2 text-center py-6 text-gray-500 ">
                  <span className="text-4xl block mb-2">📚</span>
                  <span className="text-sm">No quizzes available yet! 🎯</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Upcoming Exams with Modern Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0 transform  transition-all duration-500 ">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2 ">⏰</span>
                <Award className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Upcoming Exams 🎯
              </h2>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white  transition-all duration-300">
                <Link to="/exams" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid gap-3 md:gap-4">
              {upcomingExams.slice(0, 1).map((exam, index) => (
                <div key={exam.id} className="" style={{ animationDelay: `${index * 100}ms` }}>
                  <ExamCard exam={exam} />
                </div>
              ))}
              {upcomingExams.length === 0 && (
                <div className="text-center py-6 text-gray-500 ">
                  <span className="text-4xl block mb-2">📅</span>
                  <span className="text-sm">No upcoming exams scheduled! 🎉</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Current Affairs with Enhanced Visual Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0 transform  transition-all duration-500 ">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 md:p-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2 ">📰</span>
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Latest News & Updates 🔥
              </h2>
              <div className="flex items-center gap-2">
                <Select value={affairsDateFilter} onValueChange={(val: any) => setAffairsDateFilter(val)}>
                  <SelectTrigger className="w-[120px] h-8 bg-white/20 border-white/30 text-white text-xs">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                  </SelectContent>
                </Select>
                <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white  transition-all duration-300 h-8">
                  <Link to="/current-affairs" className="flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <Carousel
              opts={{ 
                align: "start",
                loop: true
              }}
              className="w-full"
            >
              <CarouselContent>
                {recentCurrentAffairs.map((article, index) => (
                  <CarouselItem key={article.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 " style={{ animationDelay: `${index * 100}ms` }}>
                      <CurrentAffairCard 
                        article={{
                          ...article,
                          tokenPrice: article.token_price
                        }}
                        isPremium={article.isPremium}
                        isDashboard={true}
                        showMetadataOnly={true}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="static translate-y-0 h-8 w-8  transition-all duration-300" />
                <CarouselNext className="static translate-y-0 h-8 w-8  transition-all duration-300" />
              </div>
            </Carousel>
            
            {recentCurrentAffairs.length === 0 && (
              <div className="text-center py-6 text-gray-500 ">
                <span className="text-4xl block mb-2">📰</span>
                <span className="text-sm">No current affairs available! 📚</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
