import { useState, useEffect } from 'react';
import { guestRateLimit } from '@/utils/sanitization';

export const useGuestAuth = () => {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const guestStatus = localStorage.getItem('isGuest');
    const isGuestUser = guestStatus === 'true';
    setIsGuest(isGuestUser);
    
    if (isGuestUser) {
      const id = guestRateLimit.getGuestId();
      setGuestId(id);
    }
  }, []);

  const setGuestUser = () => {
    // Generate secure guest session
    const id = guestRateLimit.getGuestId();
    const sessionData = {
      isGuest: true,
      guestId: id,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestSession', JSON.stringify(sessionData));
    setIsGuest(true);
    setGuestId(id);
  };

  const clearGuestUser = () => {
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestSession');
    // Clear any guest rate limit data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('rate_limit_guest_')) {
        localStorage.removeItem(key);
      }
    });
    setIsGuest(false);
    setGuestId(null);
  };

  const checkGuestAction = (actionType: string, maxActions: number = 10): boolean => {
    if (!isGuest) return true;
    return guestRateLimit.checkLimit(actionType, maxActions);
  };

  const validateGuestSession = (): boolean => {
    if (!isGuest) return true;
    
    const sessionData = localStorage.getItem('guestSession');
    if (!sessionData) {
      clearGuestUser();
      return false;
    }
    
    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - session.createdAt > maxAge) {
        clearGuestUser();
        return false;
      }
      
      // Update last activity
      session.lastActivity = now;
      localStorage.setItem('guestSession', JSON.stringify(session));
      return true;
    } catch {
      clearGuestUser();
      return false;
    }
  };

  return {
    isGuest,
    guestId,
    setGuestUser,
    clearGuestUser,
    checkGuestAction,
    validateGuestSession,
  };
};