import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdvertisements } from '@/hooks/useAdvertisements';

interface AdDisplayProps {
  onClose: () => void;
  placement?: 'quiz' | 'dashboard' | 'results' | 'current_affairs';
}

const AdDisplay: React.FC<AdDisplayProps> = ({ onClose, placement = 'quiz' }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const { advertisements } = useAdvertisements(placement);
  
  // Pick a random ad if multiple are available
  const currentAd = advertisements.length > 0 
    ? advertisements[Math.floor(Math.random() * advertisements.length)]
    : null;

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (!currentAd) {
    // If no ad is available, just close immediately
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            <AlertCircle className="w-4 h-4" />
            Advertisement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentAd.image_url ? (
            <div className="w-full h-48 rounded-md overflow-hidden">
              <img 
                src={currentAd.image_url} 
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No image available</p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">{currentAd.title}</h3>
            <p className="text-sm text-muted-foreground">{currentAd.description}</p>
          </div>

          {currentAd.link_url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(currentAd.link_url!, '_blank')}
            >
              Learn More <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          )}
          
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground pt-2">
            <Clock className="w-4 h-4" />
            <span>Continue in {timeLeft}s</span>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full"
            disabled={timeLeft > 0}
          >
            {timeLeft > 0 ? `Wait ${timeLeft}s` : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdDisplay;
