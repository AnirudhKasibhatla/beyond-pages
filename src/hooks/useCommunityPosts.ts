import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  book_title?: string;
  book_author?: string;
  rating?: number;
  book_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_repost: boolean;
  original_post_id?: string;
  // Joined data
  author: {
    name: string;
    username?: string;
    avatar?: string;
    level: number;
    isFollowing: boolean;
  };
  user_liked: boolean;
  replies: CommunityReply[];
}

export interface CommunityReply {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: {
    name: string;
    username?: string;
  };
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch posts with user profiles using simple join
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get profiles separately to avoid complex joins
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, username')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

      // Get likes for current user (only if authenticated)
      let userLikedPosts = new Set<string>();
      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) throw likesError;
        userLikedPosts = new Set(likesData?.map(like => like.post_id) || []);
      }

      // Get replies for all posts
      const { data: repliesData, error: repliesError } = await supabase
        .from('community_post_replies')
        .select('*')
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Get profiles for reply authors
      const replyUserIds = [...new Set(repliesData?.map(reply => reply.user_id) || [])];
      const { data: replyProfilesData } = await supabase
        .from('profiles')
        .select('user_id, name, username')
        .in('user_id', replyUserIds);

      const replyProfilesMap = new Map(replyProfilesData?.map(profile => [profile.user_id, profile]) || []);

      // Group replies by post_id
      const repliesByPost = (repliesData || []).reduce((acc, reply) => {
        if (!acc[reply.post_id]) {
          acc[reply.post_id] = [];
        }
        const replyProfile = replyProfilesMap.get(reply.user_id);
        acc[reply.post_id].push({
          id: reply.id,
          user_id: reply.user_id,
          post_id: reply.post_id,
          content: reply.content,
          created_at: reply.created_at,
          author: {
            name: replyProfile?.name || 'Anonymous',
            username: replyProfile?.username,
          },
        });
        return acc;
      }, {} as Record<string, CommunityReply[]>);

      // Transform posts
      const transformedPosts = (postsData || []).map(post => {
        const profile = profilesMap.get(post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          book_title: post.book_title,
          book_author: post.book_author,
          rating: post.rating,
          book_id: post.book_id,
          created_at: post.created_at,
          updated_at: post.updated_at,
          likes_count: post.likes_count,
          is_repost: post.is_repost,
          original_post_id: post.original_post_id,
          author: {
            name: profile?.name || 'Anonymous',
            username: profile?.username,
            level: 1, // Default level for now
            isFollowing: false, // Default for now
          },
          user_liked: user ? userLikedPosts.has(post.id) : false,
          replies: repliesByPost[post.id] || [],
        };
      });

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: {
    content: string;
    book_title?: string;
    book_author?: string;
    rating?: number;
    book_id?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create posts",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          book_title: postData.book_title,
          book_author: postData.book_author,
          rating: postData.rating,
          book_id: postData.book_id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });

      // Refresh posts
      await fetchPosts();
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like posts",
          variant: "destructive",
        });
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_liked: !p.user_liked,
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const addReply = async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to reply to posts",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('community_post_replies')
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, username')
        .eq('user_id', user.id)
        .single();

      const newReply: CommunityReply = {
        id: data.id,
        user_id: data.user_id,
        post_id: data.post_id,
        content: data.content,
        created_at: data.created_at,
        author: {
          name: profileData?.name || 'Anonymous',
          username: profileData?.username,
        },
      };

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, replies: [...post.replies, newReply] }
          : post
      ));

      toast({
        title: "Reply added!",
        description: "Your reply has been posted.",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  const updatePost = async (postId: string, updates: Partial<Pick<CommunityPost, 'content'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to edit posts",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .update(updates)
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      ));

      toast({
        title: "Post updated!",
        description: "Your post has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to delete posts",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.filter(post => post.id !== postId));

      toast({
        title: "Post deleted!",
        description: "Your post has been removed.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription for posts
    const channel = supabase
      .channel('community-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          fetchPosts(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    addReply,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};