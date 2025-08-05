import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Highlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author?: string;
  page_number?: string;
  created_at: string;
}

export const useHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHighlights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast({
        title: "Error",
        description: "Failed to load highlights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = async (highlight: Omit<Highlight, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: user.id,
          quote_text: highlight.quote_text,
          book_title: highlight.book_title,
          book_author: highlight.book_author,
          page_number: highlight.page_number,
        })
        .select()
        .single();

      if (error) throw error;
      
      setHighlights(prev => [data, ...prev]);
      toast({
        title: "Highlight added",
        description: "Quote added to your highlights",
      });
    } catch (error) {
      console.error('Error adding highlight:', error);
      toast({
        title: "Error",
        description: "Failed to add highlight",
        variant: "destructive",
      });
    }
  };

  const deleteHighlight = async (id: string) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHighlights(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Highlight removed",
        description: "Quote removed from highlights",
      });
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast({
        title: "Error",
        description: "Failed to remove highlight",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  return {
    highlights,
    loading,
    addHighlight,
    deleteHighlight,
    refetch: fetchHighlights,
  };
};