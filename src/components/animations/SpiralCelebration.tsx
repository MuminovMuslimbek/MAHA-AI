
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpiralCelebrationProps {
  show: boolean;
  isCorrect: boolean;
}

const SpiralCelebration: React.FC<SpiralCelebrationProps> = ({ show, isCorrect }) => {
  if (!isCorrect) return null;

  const spiralVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      rotate: 0
    },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0.8, 0],
      rotate: [0, 180, 360, 540],
      transition: {
        duration: 2,
        ease: "easeOut",
        times: [0, 0.3, 0.6, 1]
      }
    }
  };

  const particleVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0
    },
    visible: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.cos(i * 60 * Math.PI / 180) * 100],
      y: [0, Math.sin(i * 60 * Math.PI / 180) * 100],
      transition: {
        duration: 1.5,
        delay: 0.2,
        ease: "easeOut"
      }
    })
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Main spiral */}
          <motion.div
            variants={spiralVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          </motion.div>

          {/* Spiral particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={particleVariants}
              initial="hidden"
              animate="visible"
              className="absolute w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <span className="text-lg">✨</span>
            </motion.div>
          ))}

          {/* Success text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-1/3 text-center"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-lg font-bold">Correct! 🎯</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SpiralCelebration;
