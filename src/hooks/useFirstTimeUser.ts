import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useReadingChallenges } from './useReadingChallenges';

export const useFirstTimeUser = () => {
  const { user } = useAuth();
  const { challenges, loading } = useReadingChallenges();
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!user || loading || hasChecked) return;

    // Check if user has any reading challenges for current year
    const currentYear = new Date().getFullYear();
    const hasCurrentYearChallenge = challenges.some(challenge => challenge.year === currentYear);
    
    if (!hasCurrentYearChallenge) {
      setShowModal(true);
    }
    setHasChecked(true);
  }, [user, challenges, loading, hasChecked]);

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    showModal,
    closeModal,
  };
};