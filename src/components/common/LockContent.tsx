
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TokenService } from '@/services/TokenService';
import { motion, AnimatePresence } from 'framer-motion';

interface LockContentProps {
  tokenCost?: number;
  children: React.ReactNode;
  title?: string;
  description?: string;
  isPremium?: boolean; // Added isPremium prop
}

const LockContent: React.FC<LockContentProps> = ({ 
  tokenCost = 1, 
  children,
  title = "Locked Content", 
  description = "You need tokens to access this content",
  isPremium = false // Default value
}) => {
  const { currentUser, consumeTokens } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  // If content is not premium, show it directly
  if (!isPremium) {
    return <>{children}</>;
  }
  
  const handleUnlock = () => {
    if (consumeTokens(tokenCost)) {
      setIsUnlocking(true);
      setTimeout(() => {
        setUnlocked(true);
        setIsUnlocking(false);
      }, 1500);
    }
  };
  
  if (unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <Card className="relative flex flex-col items-center justify-center p-6 text-center space-y-4 overflow-hidden">
      <AnimatePresence>
        {isUnlocking && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              >
                <Sparkles className="h-6 w-6 text-amber-400" />
              </motion.div>
            ))}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
            />
          </>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={isUnlocking ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 1.5 }}
      >
        <Lock className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">
        {description}<br />
        <span className="font-semibold text-amber-600">Cost: {tokenCost} token{tokenCost !== 1 ? 's' : ''}</span>
      </p>
      
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handleUnlock}
          disabled={!TokenService.hasEnoughTokens(currentUser, tokenCost) || isUnlocking}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
        >
          {isUnlocking ? (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin" />
              Unlocking...
            </span>
          ) : (
            `Unlock with ${tokenCost} Token${tokenCost !== 1 ? 's' : ''}`
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground">
          {TokenService.getTokenMessage(currentUser)}
        </p>
      </div>
    </Card>
  );
};

export default LockContent;
