
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import MainLayout from '@/layouts/MainLayout';
import TokenDisplay from '@/components/common/TokenDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FloatingSymbol from '@/components/animations/FloatingSymbol';
import FloatingEmoji from '@/components/animations/FloatingEmoji';
import ScoreBoard from '@/components/quiz/ScoreBoard';
import { toast } from '@/hooks/use-toast';
import { TokenService } from '@/services/TokenService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Question {
  text: string;
  options: string[];
  correctOptionIndex: number;
  image?: string;
}

const ExamAttemptContent: React.FC<{ examId: string }> = ({ examId }) => {
  const { exams, quizzes, consumeTokens, currentUser, addTokens } = useApp();
  const navigate = useNavigate();
  const exam = exams.find(e => e.id === examId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [showStartAlert, setShowStartAlert] = useState(true);
  const [examStarted, setExamStarted] = useState(false);

  // Get all questions from exam quizzes
  const allQuestions: Question[] = [];
  if (exam) {
    exam.quizzes.forEach(quizId => {
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz) {
        allQuestions.push(...quiz.questions);
      }
    });
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isAnswered && examStarted) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, examStarted]);

  useEffect(() => {
    if (!isAnswered && examStarted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAnswered, examStarted]);

  if (!exam) return <div>Exam not found</div>;

  const currentQuestion = allQuestions[currentQuestionIndex];

  const handleStartExam = () => {
    setShowStartAlert(false);
    setExamStarted(true);
    toast({
      title: "Exam Started! 🎯",
      description: `Good luck with "${exam.title}". You have ${exam.duration} minutes to complete all questions.`
    });
  };

  const handleAnswer = (selectedOptionIndex: number) => {
    if (isAnswered) return;
    
    if (!TokenService.hasEnoughTokens(currentUser, 1)) {
      setShowTokenAlert(true);
      return;
    }

    if (!consumeTokens(1)) {
      setShowTokenAlert(true);
      return;
    }
    
    setIsAnswered(true);
    setShowSymbols(true);
    setSelectedAnswers([...selectedAnswers, selectedOptionIndex]);

    if (currentQuestionIndex === allQuestions.length - 1) {
      setTimeout(() => {
        setShowScoreboard(true);
      }, 2500);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswered(false);
        setTimeLeft(20);
      }, 2500);
    }
  };

  const handleBuyTokens = () => {
    addTokens(10);
    setShowTokenAlert(false);
    toast({
      title: "Tokens Added",
      description: "10 tokens have been added to your account."
    });
  };

  const handleEndExam = () => {
    setShowTokenAlert(false);
    setShowScoreboard(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {showScoreboard ? (
        <>
          <ScoreBoard
            score={selectedAnswers.filter((answer, index) => 
              answer === allQuestions[index].correctOptionIndex
            ).length}
            totalQuestions={allQuestions.length}
            timeSpent={timeSpent}
          />
          <FloatingEmoji show={true} isCorrect={true} />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="flex items-center gap-4">
              <TokenDisplay showAddButton={false} />
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                <Timer className="h-5 w-5" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {examStarted && currentQuestion && (
            <div className="relative min-h-[600px] w-full">
              <Card className="absolute inset-0 transition-all duration-300 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-700">Question {currentQuestionIndex + 1}</CardTitle>
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full shadow-sm">
                      {currentQuestionIndex + 1} of {allQuestions.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {currentQuestion.image && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <img 
                        src={currentQuestion.image} 
                        alt="Question illustration" 
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  <p className="text-xl mb-8 font-medium leading-relaxed text-gray-800">{currentQuestion.text}</p>
                  
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {currentQuestion.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        onClick={() => !isAnswered && handleAnswer(optIdx)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-3",
                          !isAnswered && "hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transform hover:scale-102",
                          isAnswered && optIdx === currentQuestion.correctOptionIndex && "bg-green-100 border-green-400 text-green-800",
                          isAnswered && optIdx !== currentQuestion.correctOptionIndex && 
                          selectedAnswers[currentQuestionIndex] === optIdx && "bg-red-100 border-red-400 text-red-800",
                          !isAnswered && "bg-white border-gray-200"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full shrink-0 font-bold",
                          isAnswered && optIdx === currentQuestion.correctOptionIndex ? "bg-green-500 text-white" : 
                          isAnswered && selectedAnswers[currentQuestionIndex] === optIdx && optIdx !== currentQuestion.correctOptionIndex ? "bg-red-500 text-white" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {isAnswered && optIdx === currentQuestion.correctOptionIndex ? (
                            <Check className="h-6 w-6" />
                          ) : isAnswered && selectedAnswers[currentQuestionIndex] === optIdx && optIdx !== currentQuestion.correctOptionIndex ? (
                            <X className="h-6 w-6" />
                          ) : String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-lg font-medium">{option}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <FloatingSymbol 
                  isCorrect={isAnswered && selectedAnswers[currentQuestionIndex] === currentQuestion.correctOptionIndex}
                  show={showSymbols}
                />
                <FloatingEmoji 
                  show={isAnswered}
                  isCorrect={selectedAnswers[currentQuestionIndex] === currentQuestion.correctOptionIndex}
                />
              </Card>
            </div>
          )}
        </>
      )}

      {/* Exam Start Alert */}
      <Dialog open={showStartAlert} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              Ready to Start Exam?
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">📋 {exam.title}</h3>
              <p className="text-sm text-blue-600 mb-2">{exam.description}</p>
              <div className="space-y-1 text-sm">
                <p><strong>Duration:</strong> {exam.duration} minutes</p>
                <p><strong>Questions:</strong> {allQuestions.length}</p>
                <p><strong>Cost:</strong> 1 token per question</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Once you start, the timer will begin immediately. Make sure you're ready!
            </p>
          </div>
          <DialogFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/exams')}>
              Cancel
            </Button>
            <Button onClick={handleStartExam} className="bg-blue-600 hover:bg-blue-700">
              🚀 Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token Alert */}
      <Dialog open={showTokenAlert} onOpenChange={setShowTokenAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Out of Tokens</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="mb-4">You don't have enough tokens to continue this exam.</p>
            <p className="mb-6">Would you like to buy more tokens or end the exam?</p>
          </div>
          <DialogFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleEndExam}>
              End Exam
            </Button>
            <Button onClick={handleBuyTokens}>
              Buy 10 Tokens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ExamAttempt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exams } = useApp();
  
  const exam = exams.find(e => e.id === id);
  
  if (!exam) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold">Exam not found</h2>
          <p className="mt-2 text-muted-foreground">The requested exam does not exist.</p>
          <button 
            onClick={() => navigate('/exams')}
            className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Back to Exams
          </button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/exams')}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <span className="mr-1">←</span> Back to Exams
        </button>
        <TokenDisplay />
      </div>
      
      <ExamAttemptContent examId={id!} />
    </MainLayout>
  );
};

export default ExamAttempt;
