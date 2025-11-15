
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FloatingEmojiProps {
  show: boolean;
  isCorrect?: boolean;
}

const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ show, isCorrect = true }) => {
  const [emojis, setEmojis] = useState<{ 
    id: number; 
    x: number; 
    y: number; 
    emoji: string; 
    scale: number; 
    delay: number; 
    rotation: number;
    vx: number;
    vy: number;
    animationType: string;
  }[]>([]);
  
  useEffect(() => {
    if (show && isCorrect) {
      // More diverse and exciting emoji collection
      const celebrationEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🥳', '🎈', '🎯', '🏆', '⭐', '🔥', '💯', '🚀', '🎪', '🎭', '🎨', '🎵', '🎶', '💝', '🎀', '🌈', '⚡', '💎', '🦄', '🌺', '🌸', '🎂', '🍾', '🥂', '🎼'];
      const magicalEmojis = ['✨', '🌟', '💫', '⭐', '🔮', '🌙', '☄️', '💎', '🦋', '🌺'];
      const partyEmojis = ['🎉', '🎊', '🥳', '🎈', '🎪', '🎭', '🎨', '🎵'];
      
      // Create multiple waves of emojis with different animation types
      const waves = [
        // Wave 1: Burst from center
        ...Array.from({ length: 30 }, (_, i) => ({
          id: Date.now() + i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50 + (Math.random() - 0.5) * 20,
          emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
          scale: Math.random() * 1.5 + 0.8,
          delay: Math.random() * 500,
          rotation: Math.random() * 360,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          animationType: 'burst'
        })),
        
        // Wave 2: Magical sparkles from corners
        ...Array.from({ length: 20 }, (_, i) => ({
          id: Date.now() + i + 100,
          x: Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20,
          y: Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20,
          emoji: magicalEmojis[Math.floor(Math.random() * magicalEmojis.length)],
          scale: Math.random() * 1.2 + 0.6,
          delay: Math.random() * 1000 + 500,
          rotation: Math.random() * 360,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          animationType: 'sparkle'
        })),
        
        // Wave 3: Party emojis falling from top
        ...Array.from({ length: 25 }, (_, i) => ({
          id: Date.now() + i + 200,
          x: Math.random() * 100,
          y: -10,
          emoji: partyEmojis[Math.floor(Math.random() * partyEmojis.length)],
          scale: Math.random() * 1.8 + 1,
          delay: Math.random() * 1500 + 1000,
          rotation: Math.random() * 360,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 2,
          animationType: 'rain'
        })),
        
        // Wave 4: Spiraling emojis
        ...Array.from({ length: 15 }, (_, i) => ({
          id: Date.now() + i + 300,
          x: 50,
          y: 50,
          emoji: '🌟✨💫⭐🔥💯🚀🎯🏆🥳'[Math.floor(Math.random() * 10)],
          scale: Math.random() * 1.3 + 0.7,
          delay: i * 100 + 2000,
          rotation: i * 24,
          vx: Math.cos(i * 0.4) * 4,
          vy: Math.sin(i * 0.4) * 4,
          animationType: 'spiral'
        }))
      ];
      
      setEmojis(waves);

      const timer = setTimeout(() => {
        setEmojis([]);
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      setEmojis([]);
    }
  }, [show, isCorrect]);

  if (!show || !isCorrect) return null;

  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none overflow-hidden z-50",
      "bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 backdrop-blur-sm"
    )}>
      {/* Pulsing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 animate-pulse"></div>
      
      {/* Central celebration burst */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="text-9xl sm:text-[12rem] md:text-[16rem] animate-bounce">
            🎉
          </div>
          {/* Rotating ring around main emoji */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <div className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 border-8 border-yellow-400/50 rounded-full flex items-center justify-center">
              <div className="text-6xl animate-pulse">✨</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating celebration emojis with different animations */}
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className={cn(
            "absolute text-2xl sm:text-3xl md:text-4xl lg:text-6xl transition-all duration-1000",
            emoji.animationType === 'burst' && "emoji-burst",
            emoji.animationType === 'sparkle' && "emoji-sparkle",
            emoji.animationType === 'rain' && "emoji-rain",
            emoji.animationType === 'spiral' && "emoji-spiral"
          )}
          style={{ 
            left: `${emoji.x}%`,
            top: `${emoji.y}%`, 
            transform: `scale(${emoji.scale}) rotate(${emoji.rotation}deg)`,
            animationDelay: `${emoji.delay}ms`,
            animationDuration: emoji.animationType === 'rain' ? '4s' : emoji.animationType === 'spiral' ? '5s' : '3s',
            '--float-x': `${emoji.vx * 150}px`,
            '--float-y': `${emoji.vy * 150}px`,
            '--spiral-radius': '200px'
          } as React.CSSProperties}
        >
          {emoji.emoji}
        </div>
      ))}

      {/* Multi-layered success message with animations */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-32 sm:mt-40">
        <div className="relative">
          {/* Glow effect behind message */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
          
          {/* Main message card */}
          <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl px-8 py-6 shadow-2xl border-4 border-gradient-to-r from-yellow-400 to-pink-500 animate-bounce" style={{ animationDuration: '1s' }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-4xl animate-spin" style={{ animationDuration: '2s' }}>🏆</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
                EXCELLENT!
              </h2>
              <div className="text-4xl animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>⭐</div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-700 mb-2">
              Perfect Answer! 🎯
            </p>
            <p className="text-lg text-purple-600 font-semibold">
              You're on fire! Keep it up! 🔥
            </p>
            
            {/* Floating mini emojis around message */}
            <div className="absolute -top-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute -top-4 -right-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🌟</div>
            <div className="absolute -bottom-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>💫</div>
            <div className="absolute -bottom-4 -right-4 text-2xl animate-bounce" style={{ animationDelay: '2s' }}>⚡</div>
          </div>
        </div>
      </div>
      
      {/* Screen flash effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-pink-500/30 animate-ping" style={{ animationDuration: '1s' }}></div>
    </div>
  );
};

export default FloatingEmoji;
