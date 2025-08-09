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
}

interface CommunityContextValue {
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  addPost: (payload: {
    content: string;
    bookTitle?: string;
    bookAuthor?: string;
    rating?: number;
    authorName?: string;
    authorLevel?: number;
    authorAvatar?: string;
  }) => void;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

const initialPosts: CommunityPost[] = [
  {
    id: '1',
    author: { name: 'Sarah Chen', level: 15, isFollowing: false },
    content: 'Just finished "The Seven Husbands of Evelyn Hugo" and I\'m completely blown away! The storytelling is incredible and the characters feel so real. Anyone else read this?',
    bookTitle: 'The Seven Husbands of Evelyn Hugo',
    bookAuthor: 'Taylor Jenkins Reid',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 23,
    isLiked: false,
    replies: [
      {
        id: 'r1',
        author: { name: 'Alex Johnson' },
        content: 'Yes! That book changed my perspective on storytelling. The plot twists were amazing!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '2',
    author: { name: 'Marcus Rodriguez', level: 8, isFollowing: true },
    content: 'Starting my journey with "Dune" today. I\'ve heard so much about this series. Any tips for a first-time reader?',
    bookTitle: 'Dune',
    bookAuthor: 'Frank Herbert',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 15,
    isLiked: true,
    replies: []
  },
  {
    id: '3',
    author: { name: 'Emily Watson', level: 22, isFollowing: false },
    content: 'Book club meeting tonight! We\'re discussing "Atomic Habits" and I can\'t wait to share my insights. The concepts in this book are life-changing.',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 31,
    isLiked: false,
    replies: []
  }
];

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

  const addPost: CommunityContextValue["addPost"] = ({ content, bookTitle, bookAuthor, rating, authorName, authorLevel, authorAvatar }) => {
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: authorName || 'You',
        avatar: authorAvatar,
        level: authorLevel ?? 1,
        isFollowing: false,
      },
      content,
      bookTitle,
      bookAuthor,
      rating,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
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
