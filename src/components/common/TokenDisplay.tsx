
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Coins, Plus } from 'lucide-react';

interface TokenDisplayProps {
  showAddButton?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ showAddButton = false }) => {
  const { profile, updateProfile } = useProfile();
  const isMobile = useIsMobile();
  
  const handleAddTokens = () => {
    if (profile) {
      updateProfile.mutate({ tokens: profile.tokens + 5 });
    }
  };
  
  if (!profile) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-1 sm:gap-2 animate-fade-in">
      <Badge 
        variant="outline" 
        className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'} 
        bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 
        hover:from-yellow-200 hover:to-amber-200 transition-all duration-300
        shadow-md`}
      >
        <Coins className="h-3 w-3 mr-1 text-yellow-600" />
        <span className="font-bold text-yellow-800"><span className="emoji-bounce">💰</span> {profile.tokens}</span> 
        <span className="text-yellow-700 ml-1">Token{profile.tokens !== 1 ? 's' : ''}</span>
      </Badge>
      
      {showAddButton && (
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"} 
          onClick={handleAddTokens} 
          className="text-xs h-7 px-2 bg-gradient-to-r from-green-100 to-emerald-100 
          hover:from-green-200 hover:to-emerald-200 border-green-300 text-green-700
          hover:scale-105 transition-all duration-300 shadow-md"
        >
          <Plus className="h-3 w-3 mr-1" />
          <span className="emoji-bounce">➕</span> Add Tokens
        </Button>
      )}
    </div>
  );
};

export default TokenDisplay;
