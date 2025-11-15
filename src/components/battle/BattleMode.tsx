
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Trophy, Zap, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoomCard from './RoomCard';
import BattleRoom from './BattleRoom';

interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdBy: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

const BattleMode: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [hasRoomCard, setHasRoomCard] = useState(true); // Mock - in real app, check user's inventory
  const { toast } = useToast();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!hasRoomCard) {
      toast({
        title: "Room Card Required",
        description: "You need a Room Card to create a battle room!",
        variant: "destructive",
      });
      return;
    }

    if (!roomName.trim() || !playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both room name and your player name.",
        variant: "destructive",
      });
      return;
    }

    const newRoom: Room = {
      id: generateRoomId(),
      name: roomName,
      players: [{
        id: 'player1',
        name: playerName,
        score: 0,
        isReady: false
      }],
      maxPlayers: 10, // No limit mentioned, but setting reasonable default
      status: 'waiting',
      createdBy: 'player1'
    };

    setRooms([...rooms, newRoom]);
    setCurrentRoom(newRoom);
    setRoomName('');
    
    toast({
      title: "Room Created!",
      description: `Room "${newRoom.name}" created with ID: ${newRoom.id}`,
    });
  };

  const joinRoom = () => {
    if (!joinRoomId.trim() || !playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both room ID and your player name.",
        variant: "destructive",
      });
      return;
    }

    const room = rooms.find(r => r.id === joinRoomId.toUpperCase());
    if (!room) {
      toast({
        title: "Room Not Found",
        description: "No room found with that ID.",
        variant: "destructive",
      });
      return;
    }

    if (room.status === 'playing') {
      toast({
        title: "Room In Progress",
        description: "This room is currently playing a game.",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: `player${room.players.length + 1}`,
      name: playerName,
      score: 0,
      isReady: false
    };

    const updatedRoom = {
      ...room,
      players: [...room.players, newPlayer]
    };

    setRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
    setJoinRoomId('');

    toast({
      title: "Joined Room!",
      description: `Welcome to "${room.name}"!`,
    });
  };

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  const shareRoom = (room: Room) => {
    const shareData = {
      title: `Join my battle room: ${room.name}`,
      text: `Room ID: ${room.id}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyRoomId(room.id);
    }
  };

  if (currentRoom) {
    return (
      <BattleRoom 
        room={currentRoom} 
        onLeaveRoom={() => setCurrentRoom(null)}
        onUpdateRoom={(updatedRoom) => {
          setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          setCurrentRoom(updatedRoom);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="modern-quiz-header mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
                Battle Mode
              </h1>
              <p className="text-sm sm:text-base opacity-90 mt-1">
                Challenge friends in real-time quiz battles!
              </p>
            </div>
            <RoomCard hasCard={hasRoomCard} />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Create Room Card */}
          <Card className="modern-quiz-card">
            <CardHeader className="modern-quiz-card-header text-white">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Create Battle Room
              </CardTitle>
            </CardHeader>
            <CardContent className="modern-quiz-card-content">
              <div className="space-y-4">
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full text-sm sm:text-base"
                />
                <Input
                  placeholder="Room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full text-sm sm:text-base"
                />
                <Button 
                  onClick={createRoom}
                  className="w-full modern-button"
                  disabled={!hasRoomCard}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
                {!hasRoomCard && (
                  <p className="text-xs sm:text-sm text-red-600 text-center">
                    Room Card required to create a room
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="modern-quiz-card">
            <CardHeader className="modern-quiz-card-header text-white">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join Battle Room
              </CardTitle>
            </CardHeader>
            <CardContent className="modern-quiz-card-content">
              <div className="space-y-4">
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full text-sm sm:text-base"
                />
                <Input
                  placeholder="Room ID (e.g., ABC123)"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="w-full text-sm sm:text-base"
                />
                <Button 
                  onClick={joinRoom}
                  className="w-full modern-button"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Rooms */}
        {rooms.length > 0 && (
          <Card className="modern-quiz-card">
            <CardHeader className="modern-quiz-card-header text-white">
              <CardTitle className="text-lg sm:text-xl">Active Rooms</CardTitle>
            </CardHeader>
            <CardContent className="modern-quiz-card-content">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{room.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyRoomId(room.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareRoom(room)}
                          className="h-6 w-6 p-0"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <p>ID: <span className="font-mono font-bold">{room.id}</span></p>
                      <p>Players: {room.players.length}</p>
                      <p className="capitalize">Status: {room.status}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCurrentRoom(room)}
                      className="w-full mt-3 text-xs"
                    >
                      {room.players.some(p => p.name === playerName) ? 'Rejoin' : 'View'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BattleMode;
