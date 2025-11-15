import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import DashboardStats from '@/components/common/DashboardStats';
import QuizCard from '@/components/common/QuizCard';
import ExamCard from '@/components/common/ExamCard';
import CurrentAffairCard from '@/components/common/CurrentAffairCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  BookOpen, Calendar, Activity, Users, BookOpenCheck, BookmarkPlus, GraduationCap,
  Wallet, ChevronRight, Lightbulb, Award, Sparkles
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useExams } from '@/hooks/useExams';
import { useCurrentAffairs } from '@/hooks/useCurrentAffairs';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useProfiles } from '@/hooks/useProfiles';
import { useUserRole } from '@/hooks/useUserRole';

const AdminDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = useUserRole();
  
  // Fetch data from Supabase
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { exams, isLoading: examsLoading } = useExams();
  const { currentAffairs, isLoading: currentAffairsLoading } = useCurrentAffairs();
  const { results, isLoading: resultsLoading } = useQuizResults();
  const { profiles, isLoading: profilesLoading } = useProfiles();

  // Calculate stats for dashboard
  const stats = useMemo(() => {
    // Count students from profiles
    const studentCount = profiles.length;
    
    // Count upcoming exams (current date is before end date)
    const upcomingExams = exams.filter(exam => new Date() <= new Date(exam.end_date)).length;
    
    // Count premium vs free content
    const premiumContent = quizzes.filter(quiz => quiz.is_premium).length + 
                          currentAffairs.filter(article => article.is_premium).length;
    const freeContent = quizzes.filter(quiz => !quiz.is_premium).length + 
                        currentAffairs.filter(article => !article.is_premium).length;
    
    // Calculate active users (users with recent results in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUserIds = new Set(
      results.filter(r => new Date(r.completed_at) >= sevenDaysAgo).map(r => r.user_id)
    );
    const activeUsers = activeUserIds.size;
    
    // Calculate completion rate
    const completionRate = results.length > 0 && quizzes.length > 0 && studentCount > 0 ? 
      Math.round((results.length / (quizzes.length * studentCount)) * 100) : 0;
    
    return {
      quizzes: quizzes.length,
      students: studentCount,
      currentAffairs: currentAffairs.length,
      upcomingExams,
      premiumContent,
      freeContent,
      activeUsers,
      completionRate,
    };
  }, [quizzes, exams, currentAffairs, profiles, results]);

  // Get recent activity (quiz results)
  const recentResults = [...results]
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5);

  // Get most recent content
  const recentQuizzes = [...quizzes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, isMobile ? 2 : 4);
    
  const upcomingExamsList = exams
    .filter(exam => new Date() <= new Date(exam.end_date))
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 2);
    
  const recentCurrentAffairs = [...currentAffairs]
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, isMobile ? 3 : 6);

  if (quizzesLoading || examsLoading || currentAffairsLoading || resultsLoading || profilesLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={`Admin Dashboard`}
        description={!isMobile ? "Manage your quizzes, exams, and monitor student performance." : ""}
      >
        <div className="flex gap-2">
          <Button asChild size={isMobile ? "sm" : "default"} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Link to="/admin/quizzes/new">Create Quiz</Link>
          </Button>
          <Button asChild variant="outline" size={isMobile ? "sm" : "default"}>
            <Link to="/admin/exams/new">Schedule Exam</Link>
          </Button>
        </div>
      </PageHeader>
      
      <div className="space-y-6">
        {/* Stats */}
        <DashboardStats stats={stats} userType="admin" />
        
        {/* Main Admin Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Manage class structure</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/classes">Manage Classes</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-indigo-600" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Manage subjects by class</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/subjects">Manage Subjects</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4 text-indigo-600" />
                Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Create and edit quizzes</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/quizzes">Manage Quizzes</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Current Affairs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Add news articles</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/current-affairs">Manage News</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all bg-gradient-to-r from-emerald-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-600" />
                Token Recharge
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Add tokens to student accounts</p>
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                <Link to="/admin/tokens">Manage Tokens</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Manage student accounts</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/students">Manage Students</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Manage exam schedules</p>
              <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/admin/exams">View Exams</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Quizzes with Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2">📖</span>
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Latest Quizzes
              </h2>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                <Link to="/admin/quizzes" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {recentQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={{
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description || '',
                    category: quiz.category || '',
                    timeLimit: quiz.time_limit,
                    isPremium: quiz.is_premium,
                    createdAt: new Date(quiz.created_at),
                    questions: [] // Admin dashboard doesn't need full question data
                  }} 
                  linkTo={`/admin/quizzes/edit/${quiz.id}`} 
                />
              ))}
              {recentQuizzes.length === 0 && (
                <div className="col-span-2 text-center py-6 text-gray-500">
                  <span className="text-4xl block mb-2">📚</span>
                  <span className="text-sm">No quizzes available yet!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Exams with Modern Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2">⏰</span>
                <Award className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Upcoming Exams
              </h2>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                <Link to="/admin/exams" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid gap-3 md:gap-4">
              {upcomingExamsList.map((exam) => (
                <ExamCard 
                  key={exam.id}
                  exam={{
                    id: exam.id,
                    title: exam.title,
                    description: exam.description || '',
                    startDate: new Date(exam.start_date),
                    endDate: new Date(exam.end_date),
                    duration: exam.duration,
                    quizzes: [] // Admin dashboard doesn't need full quiz IDs
                  }}
                />
              ))}
              {upcomingExamsList.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <span className="text-4xl block mb-2">📅</span>
                  <span className="text-sm">No upcoming exams scheduled!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Current Affairs with Enhanced Visual Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <span className="text-xl mr-2">📰</span>
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Latest Current Affairs
              </h2>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                <Link to="/admin/current-affairs" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
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
                {recentCurrentAffairs.map((article) => (
                  <CarouselItem key={article.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <CurrentAffairCard 
                        article={{
                          id: article.id,
                          title: article.title,
                          content: article.content,
                          category: article.category,
                          tags: article.tags,
                          imageUrl: article.image_url,
                          isPremium: article.is_premium,
                          publishedDate: new Date(article.published_date)
                        }}
                        isPremium={article.is_premium}
                        isDashboard={true}
                        showMetadataOnly={true}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                <CarouselNext className="static translate-y-0 h-8 w-8" />
              </div>
            </Carousel>
            
            {recentCurrentAffairs.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <span className="text-4xl block mb-2">📰</span>
                <span className="text-sm">No current affairs available!</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Quiz Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-indigo-600" />
              Recent Quiz Submissions
            </CardTitle>
            {!isMobile && <CardDescription>Latest quiz results from students</CardDescription>}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {recentResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent submissions</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentResults.map((result) => {
                      const quiz = quizzes.find(q => q.id === result.quiz_id);
                      const student = profiles.find(u => u.id === result.user_id);
                      
                      return (
                        <TableRow key={result.id}>
                          <TableCell>{student?.name || 'Unknown'}</TableCell>
                          <TableCell>{quiz?.title || 'Unknown'}</TableCell>
                          <TableCell>
                            {result.score}/{result.total_questions}
                          </TableCell>
                          <TableCell>{new Date(result.completed_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
