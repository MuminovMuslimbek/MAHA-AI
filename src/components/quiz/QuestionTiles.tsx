
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface QuestionTilesProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedAnswers: number[];
  correctAnswers: number[];
  onQuestionSelect: (index: number) => void;
}

const QuestionTiles: React.FC<QuestionTilesProps> = ({
  totalQuestions,
  currentQuestionIndex,
  selectedAnswers,
  correctAnswers,
  onQuestionSelect
}) => {
  const getQuestionStatus = (index: number) => {
    if (index > currentQuestionIndex) return 'upcoming';
    if (index === currentQuestionIndex) return 'current';
    if (selectedAnswers[index] === correctAnswers[index]) return 'correct';
    return 'incorrect';
  };

  return (
    <div className="w-full px-2 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-200 sticky bottom-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-gray-600">Questions</span>
        <span className="text-xs text-gray-500">
          {currentQuestionIndex + 1} of {totalQuestions}
        </span>
      </div>
      
      {/* Scrollable question tiles container with better mobile touch */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2 min-w-max px-1">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const status = getQuestionStatus(index);
            
            return (
              <motion.button
                key={index}
                onClick={() => onQuestionSelect(index)}
                disabled={index > currentQuestionIndex}
                whileHover={index <= currentQuestionIndex ? { scale: 1.05 } : {}}
                whileTap={index <= currentQuestionIndex ? { scale: 0.95 } : {}}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 relative shrink-0",
                  "touch-manipulation", // Better touch responsiveness
                  status === 'current' && "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md ring-2 ring-indigo-300",
                  status === 'correct' && "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm",
                  status === 'incorrect' && "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm",
                  status === 'upcoming' && "bg-gray-100 text-gray-400 border border-gray-200",
                  index <= currentQuestionIndex && "cursor-pointer hover:shadow-md active:scale-95",
                  index > currentQuestionIndex && "cursor-not-allowed opacity-50"
                )}
              >
                {status === 'correct' && <Check className="h-3 w-3" />}
                {status === 'incorrect' && <X className="h-3 w-3" />}
                {(status === 'current' || status === 'upcoming') && (index + 1)}
                
                {status === 'current' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-white/20"
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Compact legend */}
      <div className="flex justify-center mt-1">
        <div className="text-xs text-gray-500 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Wrong</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTiles;
