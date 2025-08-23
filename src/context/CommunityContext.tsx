import React, { createContext, useContext, useEffect, useState } from "react";

export interface Reply {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    level: number;
    isFollowing: boolean;
  };
  content: string;
  bookTitle?: string;
  bookAuthor?: string;
  rating?: number;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
  isRepost?: boolean;
  originalAuthor?: {
    name: string;
    avatar?: string;
    level: number;
  };
}

interface CommunityContextValue {
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  addPost: (post: Partial<CommunityPost> & { content: string }) => void;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

const initialPosts: CommunityPost[] = [];

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('communityPosts');
      if (saved) {
        const parsed: CommunityPost[] = JSON.parse(saved);
        // revive dates
        return parsed.map(p => ({
          ...p,
          timestamp: new Date(p.timestamp),
          replies: p.replies?.map(r => ({ ...r, timestamp: new Date(r.timestamp) })) || []
        }));
      }
    } catch {}
    return initialPosts;
  });

  useEffect(() => {
    try {
      localStorage.setItem('communityPosts', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  const addPost: CommunityContextValue["addPost"] = (postData) => {
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        level: 1,
        isFollowing: false,
      },
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      ...postData,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <CommunityContext.Provider value={{ posts, setPosts, addPost }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within a CommunityProvider');
  return ctx;
}
