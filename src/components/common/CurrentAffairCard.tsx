import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrentAffair } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, Shield, Calendar, ChevronUp, ChevronDown, Eye, BookmarkPlus, Share2, Lock, Coins, Sparkles, Zap, Brain } from 'lucide-react';
import LockContent from './LockContent';

interface CurrentAffairCardProps {
  article: CurrentAffair & {
    publishedDate: Date;
    imageUrl?: string | null;
    isPremium?: boolean;
    tokenPrice?: number;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  isPremium?: boolean;
  fullContent?: boolean;
  isDashboard?: boolean;
  showMetadataOnly?: boolean;
  isLastArticle?: boolean;
}

const CurrentAffairCard: React.FC<CurrentAffairCardProps> = ({ 
  article, 
  onNext, 
  onPrevious,
  isPremium = false, 
  fullContent = false,
  isDashboard = false,
  showMetadataOnly = false,
  isLastArticle = false
}) => {
  const isMobile = useIsMobile();
  const { currentUser, consumeTokens } = useApp();
  const [isUnlocked, setIsUnlocked] = useState(!article.isPremium);
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(article.publishedDate);

  const handleUnlock = () => {
    const tokenCost = article.tokenPrice || 1;
    if (consumeTokens(tokenCost)) {
      setIsUnlocking(true);
      
      // Create enhanced particle effect container
      const container = document.createElement('div');
      container.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(container);
      
      // Create multiple layers of particles for richer effect
      const particleTypes = [
        { emojis: ['✨', '💫', '⭐', '🌟'], count: 15, size: 'text-2xl', duration: 1.5 },
        { emojis: ['🔓', '💎', '👑', '🎉'], count: 8, size: 'text-3xl', duration: 2 },
        { emojis: ['⚡', '💥', '🔥'], count: 5, size: 'text-xl', duration: 1 }
      ];
      
      particleTypes.forEach((type, typeIndex) => {
        type.emojis.forEach((emoji, emojiIndex) => {
          for (let i = 0; i < type.count; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = emoji;
            particle.className = `absolute ${type.size} unlock-particle`;
            
            // Random positioning with bias toward center
            const centerBias = 0.3;
            const randomX = Math.random() * (1 - 2 * centerBias) + centerBias;
            const randomY = Math.random() * (1 - 2 * centerBias) + centerBias;
            
            particle.style.left = (randomX * 100) + '%';
            particle.style.top = (randomY * 100) + '%';
            particle.style.animationDelay = (Math.random() * 0.8 + typeIndex * 0.2) + 's';
            particle.style.animationDuration = type.duration + 's';
            
            // Add random rotation and scale
            const rotation = Math.random() * 360;
            const scale = 0.8 + Math.random() * 0.4;
            particle.style.transform = `rotate(${rotation}deg) scale(${scale})`;
            
            container.appendChild(particle);
          }
        });
      });
      
      // Add burst effect at unlock button position
      const unlockButton = document.querySelector('[data-unlock-button]');
      if (unlockButton) {
        const rect = unlockButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create burst particles from button center
        for (let i = 0; i < 20; i++) {
          const burstParticle = document.createElement('div');
          burstParticle.innerHTML = ['✨', '💫', '⭐'][Math.floor(Math.random() * 3)];
          burstParticle.className = 'fixed text-lg pointer-events-none z-50';
          burstParticle.style.left = centerX + 'px';
          burstParticle.style.top = centerY + 'px';
          
          // Random direction for burst
          const angle = (Math.PI * 2 * i) / 20;
          const distance = 50 + Math.random() * 100;
          const endX = centerX + Math.cos(angle) * distance;
          const endY = centerY + Math.sin(angle) * distance;
          
          burstParticle.style.animation = `burst-particle 1s ease-out forwards`;
          burstParticle.style.setProperty('--end-x', endX + 'px');
          burstParticle.style.setProperty('--end-y', endY + 'px');
          
          document.body.appendChild(burstParticle);
          
          setTimeout(() => {
            if (document.body.contains(burstParticle)) {
              document.body.removeChild(burstParticle);
            }
          }, 1000);
        }
      }
      
      // Add screen flash effect
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-gradient-to-r from-yellow-200/30 via-white/50 to-yellow-200/30 pointer-events-none z-40';
      flash.style.animation = 'flash-effect 0.6s ease-out';
      document.body.appendChild(flash);
      
      setTimeout(() => {
        if (document.body.contains(flash)) {
          document.body.removeChild(flash);
        }
      }, 600);
      
      // Add success sound effect simulation (visual feedback)
      const successIndicator = document.createElement('div');
      successIndicator.innerHTML = '🎉 UNLOCKED! 🎉';
      successIndicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-600 bg-white/90 px-6 py-3 rounded-xl shadow-lg pointer-events-none z-50 border-2 border-green-400';
      successIndicator.style.animation = 'success-bounce 1.2s ease-out';
      document.body.appendChild(successIndicator);
      
      setTimeout(() => {
        if (document.body.contains(successIndicator)) {
          document.body.removeChild(successIndicator);
        }
      }, 1200);
      
      setTimeout(() => {
        setIsUnlocked(true);
        setIsUnlocking(false);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }, 1000);
    }
  };

  const contentClass = article.isPremium && !isUnlocked ? 'premium-blur' : '';

  return (
    <Card className="overflow-hidden h-full border border-purple-100 hover:shadow-lg transition-all flex flex-col bg-white/90 backdrop-blur-sm">
      {article.imageUrl && !isDashboard && (
        <div className={`relative h-48 md:h-56 w-full overflow-hidden ${contentClass}`}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
          {article.isPremium && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black">
                <Shield className="h-3 w-3 mr-1" /> Premium
              </Badge>
            </div>
          )}
          
          {article.isPremium && !isUnlocked && (
            <div className={`premium-unlock-overlay ${isUnlocking ? 'unlock-animation' : ''}`}>
              <div className="text-center">
                <div className="relative mb-4">
                  <Lock className={`h-12 w-12 text-white mx-auto transition-all duration-300 ${isUnlocking ? 'animate-pulse' : ''}`} />
                  {isUnlocking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-yellow-300 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="mb-3 text-white/90 text-sm font-medium">
                  💎 Premium Content - {article.tokenPrice || 1} Token{(article.tokenPrice || 1) !== 1 ? 's' : ''}
                </div>
                <Button 
                  data-unlock-button
                  onClick={handleUnlock}
                  className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 ${isUnlocking ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
                  disabled={!currentUser || currentUser.tokens < (article.tokenPrice || 1) || isUnlocking}
                >
                  {isUnlocking ? (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 animate-bounce" />
                      Unlocking...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 mr-2" />
                      Unlock with {article.tokenPrice || 1} Token{(article.tokenPrice || 1) !== 1 ? 's' : ''}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className={`py-3 flex-shrink-0 border-b border-purple-50 bg-white ${isDashboard ? 'pb-1' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`text-xl font-semibold text-purple-900 ${isDashboard ? 'line-clamp-1 text-base' : 'line-clamp-2'}`}>
              {article.title}
            </CardTitle>
            <CardDescription className="flex items-center mt-1 text-gray-500">
              <Calendar className="h-3.5 w-3.5 mr-1" /> {formattedDate}
            </CardDescription>
          </div>
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">{article.category}</Badge>
        </div>
      </CardHeader>
      
      {(!isDashboard || fullContent) && !showMetadataOnly && (
        <CardContent className={`py-4 flex-grow overflow-auto ${isDashboard ? 'pt-2 pb-1' : ''} ${contentClass}`}>
          {article.isPremium && !isUnlocked ? (
            <LockContent 
              tokenCost={article.tokenPrice || 1}
              title="Premium Article"
              description="This is premium content. Unlock to read the full article."
              isPremium={true}
            >
              <p className="text-gray-600">
                {fullContent ? article.content : `${article.content.slice(0, 200)}${article.content.length > 200 ? '...' : ''}`}
              </p>
            </LockContent>
          ) : (
            <p className="text-gray-600">
              {fullContent ? article.content : `${article.content.slice(0, 200)}${article.content.length > 200 ? '...' : ''}`}
            </p>
          )}
          
          {article.tags.length > 0 && (isUnlocked || !article.isPremium) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
      
      {/* Show metadata if specified */}
      {showMetadataOnly && (
        <CardContent className={`py-2 px-3 ${article.isPremium && isDashboard ? 'blur-sm' : ''}`}>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {article.metadata?.source && (
              <span className="flex items-center">
                <span className="font-medium mr-1">Source:</span> {article.metadata.source}
              </span>
            )}
            {article.metadata?.readTime && (
              <span className="flex items-center ml-auto">
                <span className="font-medium mr-1">Read:</span> {article.metadata.readTime}
              </span>
            )}
          </div>
        </CardContent>
      )}
      
      {isDashboard ? (
        <CardFooter className="flex-shrink-0 pt-2 pb-3">
          {article.isPremium && !isUnlocked ? (
            <div className="w-full text-center">
              <div className="text-xs text-amber-600 font-medium mb-2 flex items-center justify-center">
                <Shield className="h-3 w-3 mr-1" />
                Premium - 1 Token to unlock
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm h-8">
                <Link to="/current-affairs" state={{ selectedArticleId: article.id }} className="flex items-center justify-center">
                  <Eye className="mr-2 h-3 w-3" />
                  <span>Read Article</span>
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm h-8">
              <Link to="/current-affairs" state={{ selectedArticleId: article.id }} className="flex items-center justify-center">
                <Eye className="mr-2 h-3 w-3" />
                <span>Read Article</span>
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          )}
        </CardFooter>
      ) : (
        <CardFooter className="flex-shrink-0 bg-purple-50/50 pt-2 pb-3">
          <div className="w-full space-y-2">
            {fullContent && isLastArticle && (
              <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link to="/quizzes?category=current-affairs" className="flex items-center justify-center">
                  <Brain className="mr-2 h-4 w-4" />
                  <span>Test Your Knowledge - Take Quiz</span>
                </Link>
              </Button>
            )}
            
            {!fullContent && (
              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <span className="flex items-center justify-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Full Content</span>
                </span>
              </Button>
            )}
            
            <div className="flex w-full gap-2">
              {onPrevious && (
                <Button 
                  onClick={onPrevious} 
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">Previous</span>
                </Button>
              )}
              
              {onNext && (
                <Button 
                  onClick={onNext} 
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center"
                >
                  <span className="text-sm">Next</span>
                  <ChevronUp className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CurrentAffairCard;
