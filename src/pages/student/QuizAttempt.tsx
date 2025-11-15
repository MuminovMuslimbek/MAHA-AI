
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/layouts/MainLayout';
import TokenDisplay from '@/components/common/TokenDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Check, X, AlertCircle, Sparkles, Trophy, Target, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import FloatingSymbol from '@/components/animations/FloatingSymbol';
import SpiralCelebration from '@/components/animations/SpiralCelebration';
import ScoreBoard from '@/components/quiz/ScoreBoard';
import QuestionTiles from '@/components/quiz/QuestionTiles';
import AdDisplay from '@/components/quiz/AdDisplay';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  text: string;
  options: any[];
  correct_option_index: number;
  explanation?: string | null;
  image_url?: string | null;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit: number;
  category: string | null;
  is_premium: boolean;
}

const QuizAttemptContent: React.FC<{ quizId: string }> = ({ quizId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [showStartAlert, setShowStartAlert] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData);

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions((questionsData || []) as Question[]);

        // Load user tokens
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('tokens')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setUserTokens(profileData.tokens);
          }
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, user]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isAnswered && !showAd && quizStarted) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, showAd, quizStarted]);

  // Time spent tracker
  useEffect(() => {
    if (!isAnswered && !showAd && quizStarted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAnswered, showAd, quizStarted]);

  // Ad display effect
  useEffect(() => {
    if (currentQuestionIndex > 0 && currentQuestionIndex % 5 === 0 && quizStarted) {
      setShowAd(true);
    }
  }, [currentQuestionIndex, quizStarted]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading quiz...</p>
        </div>
      </MainLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Quiz not found</p>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = questions.map(q => q.correct_option_index);

  const handleStartQuiz = () => {
    setShowStartAlert(false);
    setQuizStarted(true);
    toast({
      title: "Quiz Started! 🎯",
      description: `Good luck with "${quiz.title}". You have 10 seconds per question!`
    });
  };

  const consumeToken = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ tokens: userTokens - 1 })
        .eq('id', user.id)
        .select('tokens')
        .single();

      if (error) throw error;
      setUserTokens(data.tokens);
      return true;
    } catch (error) {
      console.error('Error consuming token:', error);
      return false;
    }
  };

  const handleAnswer = async (selectedOptionIndex: number) => {
    if (isAnswered) return;
    
    if (userTokens < 1) {
      setShowTokenAlert(true);
      return;
    }

    const success = await consumeToken();
    if (!success) {
      setShowTokenAlert(true);
      return;
    }
    
    setIsAnswered(true);
    const isCorrect = selectedOptionIndex === currentQuestion.correct_option_index;
    
    setShowSymbols(true);
    setSelectedAnswers([...selectedAnswers, selectedOptionIndex]);

    // Only show celebration for correct answers
    if (isCorrect) {
      setIsCelebrating(true);
    }

    if (currentQuestionIndex === questions.length - 1) {
      setTimeout(() => {
        saveQuizResult();
        setShowScoreboard(true);
      }, isCorrect ? 3000 : 2000);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswered(false);
        setTimeLeft(10);
        setIsCelebrating(false);
      }, isCorrect ? 3000 : 2000);
    }
  };

  const saveQuizResult = async () => {
    if (!user) return;

    const score = selectedAnswers.filter((answer, index) => 
      answer === questions[index].correct_option_index
    ).length;

    try {
      await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          score,
          total_questions: questions.length,
          time_spent: timeSpent,
          answers: selectedAnswers
        });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const handleQuestionSelect = (index: number) => {
    if (index <= currentQuestionIndex && !isAnswered) {
      setCurrentQuestionIndex(index);
      setTimeLeft(10);
    }
  };

  const handleBuyTokens = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ tokens: userTokens + 10 })
        .eq('id', user.id)
        .select('tokens')
        .single();

      if (error) throw error;
      setUserTokens(data.tokens);
      setShowTokenAlert(false);
      toast({
        title: "Tokens Added",
        description: "10 tokens have been added to your account."
      });
    } catch (error) {
      console.error('Error adding tokens:', error);
      toast({
        title: "Error",
        description: "Failed to add tokens",
        variant: "destructive"
      });
    }
  };

  const handleEndQuiz = () => {
    setShowTokenAlert(false);
    saveQuizResult();
    setShowScoreboard(true);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isAnswered) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isAnswered) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragX;
    
    const card = document.querySelector('.quiz-question-card') as HTMLElement;
    if (card) {
      card.style.transform = `translateX(${delta}px) rotate(${delta * 0.1}deg)`;
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isAnswered) return;
    setIsDragging(false);
    
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = clientX - dragX;
    
    const card = document.querySelector('.quiz-question-card') as HTMLElement;
    if (card) {
      card.style.transform = '';
      
      if (Math.abs(delta) > 100) {
        const selectedIndex = delta > 0 ? currentQuestion.correct_option_index : 
          (currentQuestion.correct_option_index === 0 ? 1 : 0);
        handleAnswer(selectedIndex);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Mobile-optimized container */}
      <div className="flex-1 px-2 sm:px-4 max-w-md mx-auto w-full">
        <div className="space-y-3 py-2">
          {showScoreboard ? (
            <>
              <ScoreBoard
                score={selectedAnswers.filter((answer, index) => 
                  answer === questions[index].correct_option_index
                ).length}
                totalQuestions={questions.length}
                timeSpent={timeSpent}
              />
              <SpiralCelebration show={true} isCorrect={true} />
            </>
          ) : showAd ? (
            <AdDisplay onClose={() => setShowAd(false)} />
          ) : (
            <>
              {/* Mobile-first Quiz Header */}
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold text-white mb-1 truncate">{quiz.title}</h1>
                      <p className="text-purple-100 text-xs truncate">{quiz.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <TokenDisplay showAddButton={false} />
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full font-bold transition-all duration-300 text-xs",
                        timeLeft <= 3 ? "bg-red-500/90 text-white animate-pulse scale-110" : 
                        timeLeft <= 5 ? "bg-orange-500/90 text-white scale-105" : 
                        "bg-white/20 backdrop-blur-sm text-white"
                      )}>
                        <Timer className="h-3 w-3" />
                        <span className="font-black">{timeLeft}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {quizStarted && (
                <div className="relative w-full">
                  {/* Compact Question Card */}
                  <Card 
                    className={cn(
                      "quiz-question-card transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden",
                      "bg-gradient-to-br from-white via-indigo-50 to-purple-50 shadow-lg rounded-xl border-0",
                      isDragging && "transition-none"
                    )}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                  >
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-sm font-black text-white">{currentQuestionIndex + 1}</span>
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-white">Question {currentQuestionIndex + 1}</CardTitle>
                            <p className="text-indigo-100 text-xs">Choose the best answer</p>
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/30">
                          <span className="text-xs font-bold">{currentQuestionIndex + 1} of {questions.length}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-3">
                      {currentQuestion.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden shadow-md">
                          <img 
                            src={currentQuestion.image_url} 
                            alt="Question illustration" 
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 mb-3 border border-indigo-100">
                        <p className="text-sm font-semibold leading-relaxed text-gray-800 text-center">{currentQuestion.text}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            onClick={() => !isAnswered && handleAnswer(optIdx)}
                            className={cn(
                              "p-2 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 group",
                              "bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-indigo-300 hover:shadow-md",
                              !isAnswered && "hover:scale-102 hover:shadow-lg cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50",
                              isAnswered && optIdx === currentQuestion.correct_option_index && "bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-400 shadow-lg scale-105",
                              isAnswered && "cursor-default"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center w-6 h-6 rounded-full shrink-0 font-bold text-xs transition-all duration-300",
                              isAnswered && optIdx === currentQuestion.correct_option_index ? "bg-emerald-500 text-white scale-110 animate-pulse" : 
                              "bg-gradient-to-r from-indigo-500 to-purple-600 text-white group-hover:scale-110"
                            )}>
                              {isAnswered && optIdx === currentQuestion.correct_option_index ? (
                                <Check className="h-3 w-3" />
                              ) : String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-xs font-medium flex-1 text-gray-800">{option}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-indigo-100 px-2 py-1 rounded-full border border-purple-200">
                          <Clock className="h-3 w-3 text-purple-600" />
                          <span className="text-purple-800 font-medium text-xs">10 seconds per question</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <FloatingSymbol 
                      isCorrect={isAnswered && selectedAnswers[currentQuestionIndex] === currentQuestion.correct_option_index}
                      show={showSymbols}
                    />
                  </Card>
                </div>
              )}

              {/* Simple spiral celebration for correct answers only */}
              <SpiralCelebration 
                show={isCelebrating}
                isCorrect={true}
              />
            </>
          )}
        </div>
      </div>

      {/* Question Tiles positioned directly below the question card */}
      {quizStarted && !showScoreboard && !showAd && (
        <div className="mt-2">
          <QuestionTiles
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswers={selectedAnswers}
            correctAnswers={correctAnswers}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>
      )}

      {/* Start Alert Dialog */}
      <Dialog open={showStartAlert} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 mx-2">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-2 right-2 opacity-30">
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Ready to Begin?</h2>
              </div>
              <p className="text-white/90 text-center text-sm">Let's test your knowledge!</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="bg-white rounded-lg p-3 shadow-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-1">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{quiz.title}</h3>
              </div>
              <p className="text-xs text-gray-600">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">TIME</span>
                </div>
                <div className="text-sm font-bold text-blue-800">10s</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">QUESTIONS</span>
                </div>
                <div className="text-sm font-bold text-green-800">{questions.length}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">CATEGORY</span>
                </div>
                <div className="text-xs font-bold text-purple-800">{quiz.category}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">TOKENS</span>
                </div>
                <div className="text-sm font-bold text-orange-800">1 per Q</div>
              </div>
            </div>

            <Button 
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Alert Dialog */}
      <Dialog open={showTokenAlert} onOpenChange={setShowTokenAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Not Enough Tokens
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You need tokens to continue this quiz. Would you like to purchase more tokens?
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
              <p className="text-sm font-medium">10 Tokens = $5</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleEndQuiz}>
              End Quiz
            </Button>
            <Button onClick={handleBuyTokens} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              Buy Tokens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const QuizAttempt: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <MainLayout>
        <div>Invalid quiz ID</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <QuizAttemptContent quizId={id} />
    </MainLayout>
  );
};

export default QuizAttempt;
