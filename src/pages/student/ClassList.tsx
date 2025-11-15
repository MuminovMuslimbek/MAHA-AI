
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronRight, Book, GraduationCap, Layers } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';

// Array of gradient classes for cards
const cardGradients = [
  'from-indigo-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
];

const emojiAnimations = ['emoji-bounce', 'emoji-pulse', 'emoji-wiggle', 'emoji-spin'];

const ClassList: React.FC = () => {
  const isMobile = useIsMobile();
  const { classes, isLoading } = useClasses();
  const { subjects } = useSubjects();

  const classesWithCounts = useMemo(() => {
    return classes.map(classItem => ({
      ...classItem,
      subjectCount: subjects.filter(s => s.class_id === classItem.id).length
    }));
  }, [classes, subjects]);

  const emojis = ['🌟', '🚀', '🎯', '⭐', '🏆', '💎', '🎨', '🔬'];

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl emoji-bounce">🎓</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Choose Your Class <span className="emoji-pulse">✨</span></h1>
          </div>
          <p className="text-white/90 text-sm md:text-base flex items-center">
            <span className="text-xl mr-2 emoji-wiggle">📚</span>
            Select a class to explore exciting subjects and learning materials
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">Loading classes...</div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classesWithCounts.map((classItem, index) => {
            const emoji = emojis[index % emojis.length];
          const gradientClass = cardGradients[index % cardGradients.length];
          const emojiAnimation = emojiAnimations[index % emojiAnimations.length];
          
            return (
              <Card 
                key={classItem.id} 
                className="overflow-hidden h-full hover:scale-105 transition-all duration-500 border-0 shadow-2xl animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className={`bg-gradient-to-br ${gradientClass} p-4 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className={`text-3xl mb-2 ${emojiAnimation} group-hover:emoji-spin`}>
                        {emoji}
                      </div>
                      <CardTitle className="text-xl font-bold">{classItem.name}</CardTitle>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      {index % 3 === 0 ? (
                        <Book className="h-6 w-6" />
                      ) : index % 3 === 1 ? (
                        <GraduationCap className="h-6 w-6" />
                      ) : (
                        <Layers className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex items-center space-x-2 text-sm mb-3">
                    <span className="font-medium text-gray-800"><span className="emoji-bounce">📖</span> Subjects:</span>
                    <span className="font-bold text-indigo-700 text-lg">{classItem.subjectCount}</span>
                    <span className="text-xl emoji-pulse">🎯</span>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center">
                    <span className="mr-1 emoji-wiggle">✨</span>
                    Explore detailed lessons and interactive quizzes
                  </div>
                </CardContent>
                <CardFooter className="bg-gradient-to-b from-gray-50 to-white pt-2 pb-4">
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white hover:scale-105 transition-all duration-300 shadow-lg"
                    size="sm"
                  >
                    <Link to={`/subjects/${classItem.id}`} className="flex justify-between items-center w-full">
                      <span className="flex items-center">
                        <span className="mr-2 emoji-bounce">🚀</span>
                        View Subjects
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default ClassList;
