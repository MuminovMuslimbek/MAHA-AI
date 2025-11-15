
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

interface DailyCoinsCardProps {
  className?: string;
}

const DailyCoinsCard: React.FC<DailyCoinsCardProps> = ({ className }) => {
  const { currentUser, claimDailyCoins, canClaimDailyCoins } = useApp();
  
  if (!currentUser) return null;
  
  const isClaimable = canClaimDailyCoins();
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 relative">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">Daily Coins</h3>
              <p className="text-amber-100 text-sm">Earn 5 tokens every day</p>
            </div>
            
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                y: [0, -2, 2, -2, 0]
              }} 
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-60"></div>
              <Coins className="h-10 w-10 text-yellow-300 relative z-10" />
            </motion.div>
          </div>
          
          <Button 
            className={`w-full mt-4 bg-white text-amber-600 hover:bg-amber-100 font-bold`}
            disabled={!isClaimable}
            onClick={() => claimDailyCoins()}
          >
            {isClaimable ? 'Claim Now' : 'Already Claimed Today'}
          </Button>
          
          {/* Decorative coins */}
          <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-yellow-300 opacity-40"></div>
          <div className="absolute top-6 right-12 w-3 h-3 rounded-full bg-yellow-300 opacity-30"></div>
          <div className="absolute bottom-8 right-4 w-4 h-4 rounded-full bg-yellow-300 opacity-20"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCoinsCard;
