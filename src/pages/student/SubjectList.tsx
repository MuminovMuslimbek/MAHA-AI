
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, Star, Sparkles, Target, Zap, ChevronRight } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useQuizzes } from '@/hooks/useQuizzes';

const subjectIcons = ['🔢', '🧪', '📚', '🌍', '🎨', '🎵', '💻', '⚽'];
const subjectColors = [
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-violet-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-cyan-500',
];
const SubjectList: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { classes } = useClasses();
  const { quizzes } = useQuizzes();

  const classSubjects = useMemo(() => {
    return subjects.filter(s => s.class_id === classId);
  }, [subjects, classId]);

  const subjectsWithQuizCount = useMemo(() => {
    return classSubjects.map((subject, index) => ({
      ...subject,
      quizCount: quizzes.filter(q => q.subject_id === subject.id).length,
      icon: subjectIcons[index % subjectIcons.length],
      color: subjectColors[index % subjectColors.length],
    }));
  }, [classSubjects, quizzes]);

  const currentClass = classes.find(c => c.id === classId);

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/subject/${subjectId}/quizzes`);
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{currentClass?.name || 'Class'}</h1>
              <p className="text-white/90 text-lg">Choose your subject to begin learning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white">{classSubjects.length}</div>
              <div className="text-sm text-white/80">Subjects</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold text-white">
                {subjectsWithQuizCount.reduce((sum, subject) => sum + subject.quizCount, 0)}
              </div>
              <div className="text-sm text-white/80">Total Quizzes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-orange-300" />
              <div className="text-2xl font-bold text-white">0%</div>
              <div className="text-sm text-white/80">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {subjectsLoading ? (
        <div className="text-center py-12">Loading subjects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsWithQuizCount.map((subject, index) => (
          <Card 
            key={subject.id} 
            className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white cursor-pointer hover:scale-105 transform"
            onClick={() => handleSubjectClick(subject.id)}
          >
            <div className={`h-24 bg-gradient-to-r ${subject.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 left-4 text-4xl">{subject.icon}</div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {subject.quizCount} Quizzes
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {subject.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>~{subject.quizCount * 5} min</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Trophy className="h-3 w-3 text-yellow-400" />
                  <span>{subject.quizCount} quizzes</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                className={`w-full font-semibold py-6 rounded-xl bg-gradient-to-r ${subject.color} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Start Learning
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </CardFooter>
          </Card>
          ))}
        </div>
      )}

      {!subjectsLoading && classSubjects.length === 0 && (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-0 shadow-xl">
          <CardContent>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Subjects Available</h3>
            <p className="text-gray-600 mb-6">
              It looks like there are no subjects configured for {currentClass?.name} yet.
            </p>
            <Button 
              onClick={() => navigate('/classes')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Classes
            </Button>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default SubjectList;
