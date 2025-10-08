import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  status: 'to-read' | 'reading' | 'finished';
  genres: string[];
  progress?: string;
  rating?: number;
  review_text?: string;
  cover_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks((data || []) as Book[]);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          isbn: book.isbn || null,
          status: book.status,
          genres: book.genres,
          progress: book.progress || null,
          rating: book.rating || null,
          review_text: book.review_text || null,
          cover_url: book.cover_url || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setBooks(prev => [data as Book, ...prev]);
      toast({
        title: "Book added",
        description: `"${book.title}" has been added to your library`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setBooks(prev => prev.map(book => book.id === id ? data as Book : book));
      toast({
        title: "Book updated",
        description: "Book has been updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating book:', error);
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete associated community posts first
      const { error: postsError } = await supabase
        .from('community_posts')
        .delete()
        .eq('book_id', id)
        .eq('user_id', user.id);

      if (postsError) console.error('Error deleting community posts:', postsError);

      // Then delete the book
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBooks(prev => prev.filter(book => book.id !== id));
      toast({
        title: "Book deleted",
        description: "Book has been removed from your library",
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBookStatus = async (id: string, status: Book['status']) => {
    await updateBook(id, { status });
  };

  const updateBookReview = async (id: string, reviewText: string, rating?: number) => {
    const bookData = await updateBook(id, { review_text: reviewText, rating });
    
    // Create or update community post when review is added/updated
    if (bookData && reviewText?.trim()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if there's already a community post for this book review
        const { data: existingPost } = await supabase
          .from('community_posts')
          .select('id')
          .eq('book_id', id)
          .eq('user_id', user.id)
          .single();

        if (existingPost) {
          // Update existing post
          const { error } = await supabase
            .from('community_posts')
            .update({
              content: reviewText,
              rating: rating || null,
            })
            .eq('id', existingPost.id);

          if (error) console.error('Error updating community post:', error);
        } else {
          // Create new post
          const { error } = await supabase
            .from('community_posts')
            .insert({
              user_id: user.id,
              content: reviewText,
              book_title: bookData.title,
              book_author: bookData.author,
              rating: rating || null,
              book_id: id,
            });

          if (error) console.error('Error creating community post:', error);
        }
      } catch (error) {
        console.error('Error handling community post for review:', error);
      }
    }
  };

  useEffect(() => {
    fetchBooks();

    // Set up real-time subscription
    const channel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBooks(prev => [payload.new as Book, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBooks(prev => prev.map(book => 
              book.id === payload.new.id ? payload.new as Book : book
            ));
          } else if (payload.eventType === 'DELETE') {
            setBooks(prev => prev.filter(book => book.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    updateBookStatus,
    updateBookReview,
    refetch: fetchBooks,
  };
};