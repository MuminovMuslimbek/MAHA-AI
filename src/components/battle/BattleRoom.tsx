
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Play, Copy, Share2, ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdBy: string;
}

interface BattleRoomProps {
  room: Room;
  onLeaveRoom: () => void;
  onUpdateRoom: (room: Room) => void;
}

const BattleRoom: React.FC<BattleRoomProps> = ({ room, onLeaveRoom, onUpdateRoom }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Find current player (in real app, this would be based on authentication)
    const player = room.players[0]; // Mock current player
    setCurrentPlayer(player);
  }, [room]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  const shareRoom = () => {
    const shareData = {
      title: `Join my battle room: ${room.name}`,
      text: `Room ID: ${room.id}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyRoomId();
    }
  };

  const toggleReady = () => {
    if (!currentPlayer) return;

    const updatedPlayers = room.players.map(player =>
      player.id === currentPlayer.id
        ? { ...player, isReady: !player.isReady }
        : player
    );

    const updatedRoom = { ...room, players: updatedPlayers };
    onUpdateRoom(updatedRoom);

    toast({
      title: currentPlayer.isReady ? "Not Ready" : "Ready!",
      description: currentPlayer.isReady ? "You're no longer ready" : "Waiting for other players...",
    });
  };

  const startGame = () => {
    const allReady = room.players.every(player => player.isReady);
    if (!allReady) {
      toast({
        title: "Not Ready",
        description: "All players must be ready to start the game.",
        variant: "destructive",
      });
      return;
    }

    const updatedRoom = { ...room, status: 'playing' as const };
    onUpdateRoom(updatedRoom);

    toast({
      title: "Game Started!",
      description: "The battle has begun!",
    });
  };

  const canStartGame = currentPlayer?.id === room.createdBy && room.players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="modern-quiz-header mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLeaveRoom}
                className="text-white hover:bg-white/20 p-1 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  {room.name}
                </h1>
                <p className="text-xs sm:text-sm md:text-base opacity-90">
                  Room ID: <span className="font-mono font-bold">{room.id}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyRoomId}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={shareRoom}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Room Status */}
        <Card className="modern-quiz-card mb-4 sm:mb-6">
          <CardContent className="modern-quiz-card-content">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Badge variant={room.status === 'waiting' ? 'secondary' : 'default'} className="text-xs sm:text-sm">
                  {room.status === 'waiting' ? 'Waiting for players' : 'Game in progress'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{room.players.length} players</span>
                </div>
              </div>
              
              {room.status === 'waiting' && (
                <div className="flex gap-2">
                  <Button
                    onClick={toggleReady}
                    variant={currentPlayer?.isReady ? "default" : "outline"}
                    size="sm"
                    className="min-w-[80px] text-xs sm:text-sm"
                  >
                    {currentPlayer?.isReady ? (
                      <>
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Ready
                      </>
                    ) : (
                      'Get Ready'
                    )}
                  </Button>
                  
                  {canStartGame && (
                    <Button
                      onClick={startGame}
                      className="modern-button text-xs sm:text-sm"
                      size="sm"
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Start Game
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="modern-quiz-card">
          <CardHeader className="modern-quiz-card-header text-white">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Players ({room.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="modern-quiz-card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {room.players.map((player, index) => (
                <div
                  key={player.id}
                  className={`bg-white rounded-lg p-3 sm:p-4 border-2 transition-all ${
                    player.isReady ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {player.id === room.createdBy && (
                        <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      )}
                      <span className="font-semibold text-sm sm:text-base truncate">
                        {player.name}
                      </span>
                    </div>
                    {player.isReady && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p>Score: {player.score}</p>
                    <p>Status: {player.isReady ? 'Ready' : 'Not Ready'}</p>
                    {player.id === room.createdBy && (
                      <Badge variant="outline" className="text-xs">
                        Room Creator
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {room.players.length < 2 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for more players to join...</p>
                <p className="text-xs mt-1">Share the room ID: <span className="font-mono font-bold">{room.id}</span></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BattleRoom;
