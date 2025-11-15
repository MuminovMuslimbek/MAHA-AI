
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quiz as DBQuiz } from '@/hooks/useQuizzes';
import { Lock, Clock, PlayCircle, CheckCircle } from 'lucide-react';

interface QuizCardProps {
  quiz: DBQuiz | any; // Allow both types for compatibility
  linkTo: string;
  isCompleted?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, linkTo, isCompleted }) => {
  return (
    <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-105">
      {/* Colored top border */}
      <div className={`h-1 bg-gradient-to-r ${
        isCompleted 
          ? 'from-green-400 to-emerald-500' 
          : (quiz.isPremium || quiz.is_premium)
            ? 'from-amber-400 to-orange-500'
            : 'from-indigo-400 to-purple-500'
      }`} />
      
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {quiz.title}
          </CardTitle>
          <div className="flex flex-col gap-1 shrink-0">
            {(quiz.isPremium || quiz.is_premium) && (
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 flex items-center gap-1 px-2 py-0.5">
                <Lock className="h-2.5 w-2.5" />
                <span className="text-xs">Pro</span>
              </Badge>
            )}
            {isCompleted && (
              <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center gap-1 px-2 py-0.5">
                <CheckCircle className="h-2.5 w-2.5" />
                <span className="text-xs">Done</span>
              </Badge>
            )}
          </div>
        </div>
        
        <CardDescription className="flex items-center gap-2 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            <span>{quiz.timeLimit || quiz.time_limit || 5}m</span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded-full text-indigo-700">
            <span className="font-medium">{quiz.questions?.length || 0}Q</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2">
        <div className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">
          {quiz.description || `${quiz.category || 'General'} quiz to test your knowledge.`}
        </div>
        
        {/* Category badge */}
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200">
            {quiz.category}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          asChild 
          className={`w-full text-xs py-2 h-9 font-semibold transition-all duration-300 ${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          } shadow-lg hover:shadow-xl group-hover:scale-105`}
        >
          <Link to={linkTo} className="flex items-center justify-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4" />
                View Results
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Start Quiz
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
