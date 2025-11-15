
import { User } from '../types';
import { toast } from '@/hooks/use-toast';

export class TokenService {
  /**
   * Check if a user has enough tokens
   */
  static hasEnoughTokens(user: User | null, amount: number = 1): boolean {
    if (!user) return false;
    return user.tokens >= amount;
  }

  /**
   * Consume tokens from a user
   */
  static consumeToken(user: User | null, amount: number = 1): boolean {
    if (!this.hasEnoughTokens(user, amount)) {
      toast({
        title: "Not enough tokens",
        description: "You don't have enough tokens for this action",
        variant: "destructive"
      });
      return false;
    }
    
    // We return true here because the actual token reduction is handled in the AppContext
    return true;
  }

  /**
   * Get token status message
   */
  static getTokenMessage(user: User | null): string {
    if (!user) return "Please log in to use tokens";
    return `You have ${user.tokens} token${user.tokens !== 1 ? 's' : ''} remaining`;
  }
  
  /**
   * Check if user can claim daily coins
   */
  static canClaimDailyCoins(user: User | null): boolean {
    if (!user || !user.lastCoinClaim) return true;
    
    const lastClaim = new Date(user.lastCoinClaim);
    const today = new Date();
    
    // Reset at midnight
    return lastClaim.getDate() !== today.getDate() || 
           lastClaim.getMonth() !== today.getMonth() || 
           lastClaim.getFullYear() !== today.getFullYear();
  }
  
  /**
   * Get time until next claim
   */
  static getTimeUntilNextClaim(user: User | null): string {
    if (!user || !user.lastCoinClaim || this.canClaimDailyCoins(user)) {
      return "Available now";
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntil = tomorrow.getTime() - new Date().getTime();
    const hoursLeft = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Available in ${hoursLeft}h ${minutesLeft}m`;
  }
}
