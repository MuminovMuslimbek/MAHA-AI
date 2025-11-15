
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Star } from 'lucide-react';

interface RoomCardProps {
  hasCard: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ hasCard }) => {
  return (
    <Card className={`w-20 sm:w-24 h-12 sm:h-14 relative overflow-hidden ${hasCard ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'}`}>
      <CardContent className="p-1 sm:p-2 h-full flex items-center justify-center">
        {hasCard ? (
          <div className="text-center">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white mx-auto mb-1" />
            <Badge variant="secondary" className="text-xs px-1 py-0">
              <Star className="h-2 w-2 mr-1" />
              ROOM
            </Badge>
          </div>
        ) : (
          <div className="text-center">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">No Card</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomCard;
