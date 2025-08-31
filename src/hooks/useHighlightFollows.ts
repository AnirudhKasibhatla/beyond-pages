import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useHighlightFollows = () => {
  const [follows, setFollows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setFollows([]);
      setLoading(false);
      return;
    }

    const fetchFollows = async () => {
      try {
        const { data, error } = await supabase
          .from('highlight_follows')
          .select('highlight_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFollows(data.map(f => f.highlight_id));
      } catch (error) {
        console.error('Error fetching follows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollows();

    // Set up real-time subscription
    const channel = supabase
      .channel('highlight-follows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'highlight_follows',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchFollows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleFollow = async (highlightId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow highlights.",
        variant: "destructive",
      });
      return;
    }

    const isFollowing = follows.includes(highlightId);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('highlight_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('highlight_id', highlightId);

        if (error) throw error;

        setFollows(prev => prev.filter(id => id !== highlightId));
        toast({
          title: "Unfollowed",
          description: "You've unfollowed this highlight.",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('highlight_follows')
          .insert({
            user_id: user.id,
            highlight_id: highlightId
          });

        if (error) throw error;

        setFollows(prev => [...prev, highlightId]);
        toast({
          title: "Following!",
          description: "You're now following this highlight.",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    follows,
    loading,
    toggleFollow,
    isFollowing: (highlightId: string) => follows.includes(highlightId)
  };
};