import { useState, useEffect } from 'react';

export const useGuestAuth = () => {
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const guestStatus = localStorage.getItem('isGuest');
    setIsGuest(guestStatus === 'true');
  }, []);

  const setGuestUser = () => {
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
  };

  const clearGuestUser = () => {
    localStorage.removeItem('isGuest');
    setIsGuest(false);
  };

  return {
    isGuest,
    setGuestUser,
    clearGuestUser,
  };
};