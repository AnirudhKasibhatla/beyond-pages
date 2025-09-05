import React, { createContext, useContext } from "react";
import { useCommunityPosts, CommunityPost, CommunityReply } from "@/hooks/useCommunityPosts";

// Export types for backward compatibility
export type { CommunityPost, CommunityReply };

// Legacy interface for backward compatibility
export interface Reply extends CommunityReply {
  timestamp: Date;
}

interface CommunityContextValue {
  posts: CommunityPost[];
  loading: boolean;
  createPost: (postData: {
    content: string;
    book_title?: string;
    book_author?: string;
    rating?: number;
    book_id?: string;
  }) => Promise<any>;
  toggleLike: (postId: string) => Promise<void>;
  addReply: (postId: string, content: string) => Promise<void>;
  updatePost: (postId: string, updates: Partial<Pick<CommunityPost, 'content'>>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const communityHook = useCommunityPosts();

  return (
    <CommunityContext.Provider value={communityHook}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within a CommunityProvider');
  return ctx;
}
