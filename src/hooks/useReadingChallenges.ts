import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

export interface ReadingChallenge {
  id: string;
  user_id: string;
  year: number;
  goal: number;
  completed: number;
  status: 'in-progress' | 'completed' | 'failed';
  best_month: string;
  favorite_genre: string;
  created_at: string;
  updated_at: string;
}

export const useReadingChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_challenges')
          .select('*')
          .eq('user_id', user.id)
          .order('year', { ascending: false });

        if (error) {
          console.error('Error fetching challenges:', error);
        } else {
          setChallenges((data || []) as ReadingChallenge[]);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();

    // Set up real-time subscription
    const channel = supabase
      .channel('reading-challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_challenges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createChallenge = async (challengeData: Omit<Partial<ReadingChallenge>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { year: number }) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('reading_challenges')
        .insert({
          ...challengeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateChallenge = async (id: string, updates: Partial<ReadingChallenge>) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('reading_challenges')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('reading_challenges')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    challenges,
    loading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
  };
};