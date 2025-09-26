import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Quote, BookOpen, Calendar, Share2, Heart, MessageCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ClickableUserName } from './ClickableUserName';
import { UserProfileView } from './UserProfileView';
import { supabase } from '@/integrations/supabase/client';

interface CommunityHighlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author?: string;
  page_number?: string;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

const mockHighlights: CommunityHighlight[] = [
  {
    id: '1',
    quote_text: 'The only way to do great work is to love what you do.',
    book_title: 'Steve Jobs',
    book_author: 'Walter Isaacson',
    page_number: '112',
    created_at: '2024-01-15T10:30:00Z',
    user: {
      id: 'user1',
      display_name: 'Sarah Johnson',
      avatar_url: '/avatars/sarah.jpg'
    },
    likes_count: 24,
    comments_count: 3,
    is_liked: false
  },
  {
    id: '2',
    quote_text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
    book_title: 'The Stranger',
    book_author: 'Albert Camus',
    page_number: '89',
    created_at: '2024-01-14T16:45:00Z',
    user: {
      id: 'user2',
      display_name: 'Mark Wilson',
      avatar_url: '/avatars/mark.jpg'
    },
    likes_count: 31,
    comments_count: 7,
    is_liked: true
  },
  {
    id: '3',
    quote_text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    book_title: 'The 7 Habits of Highly Effective People',
    book_author: 'Stephen Covey',
    page_number: '46',
    created_at: '2024-01-13T14:20:00Z',
    user: {
      id: 'user3',
      display_name: 'Emma Davis',
      avatar_url: '/avatars/emma.jpg'
    },
    likes_count: 18,
    comments_count: 2,
    is_liked: false
  }
];

export const CommunityHighlights = () => {
  const [highlights, setHighlights] = useState<CommunityHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfileView, setUserProfileView] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunityHighlights();
  }, []);

  const fetchCommunityHighlights = async () => {
    try {
      // First fetch highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('highlights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (highlightsError) {
        console.error('Error fetching highlights:', highlightsError);
        setHighlights(mockHighlights); // Fallback to mock data
        setLoading(false);
        return;
      }

      if (!highlightsData || highlightsData.length === 0) {
        setHighlights(mockHighlights); // Fallback to mock data if no highlights
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(highlightsData.map(h => h.user_id))];

      // Fetch user profiles (only safe fields for public access)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, name, profile_picture_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create profile lookup map
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      const formattedHighlights: CommunityHighlight[] = highlightsData.map(highlight => {
        const profile = profilesMap.get(highlight.user_id);
        return {
          id: highlight.id,
          quote_text: highlight.quote_text,
          book_title: highlight.book_title,
          book_author: highlight.book_author,
          page_number: highlight.page_number,
          created_at: highlight.created_at,
          user: {
            id: highlight.user_id,
            display_name: profile?.display_name || 
                         profile?.name ||
                         'Anonymous Reader',
            avatar_url: profile?.profile_picture_url || undefined
          },
          likes_count: Math.floor(Math.random() * 50), // Mock data for likes
          comments_count: Math.floor(Math.random() * 10), // Mock data for comments
          is_liked: false
        };
      });

      setHighlights(formattedHighlights);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setHighlights(mockHighlights); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    setUserProfileView({ isOpen: true, userId });
  };

  const handleLike = async (highlightId: string) => {
    setHighlights(prev => prev.map(highlight => 
      highlight.id === highlightId 
        ? { 
            ...highlight, 
            is_liked: !highlight.is_liked,
            likes_count: highlight.is_liked ? highlight.likes_count - 1 : highlight.likes_count + 1
          }
        : highlight
    ));

    toast({
      title: "Success",
      description: "Highlight interaction updated",
    });
  };

  const handleShare = async (highlight: CommunityHighlight) => {
    try {
      const shareText = `"${highlight.quote_text}" - from ${highlight.book_title} by ${highlight.book_author}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Highlight from ${highlight.book_title}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "The highlight has been copied to your clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Could not share highlight",
        variant: "destructive",
      });
    }
  };

  const handleCopyQuote = async (quote: string) => {
    try {
      await navigator.clipboard.writeText(quote);
      toast({
        title: "Copied!",
        description: "Quote copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy quote",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Quote className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Community Highlights</h3>
        <Badge variant="secondary" className="ml-2">
          {highlights.length}
        </Badge>
      </div>
      
      {highlights.map((highlight) => (
        <Card key={highlight.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={highlight.user.avatar_url} alt={highlight.user.display_name} />
                <AvatarFallback>
                  {highlight.user.display_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <ClickableUserName
                  name={highlight.user.display_name}
                  userId={highlight.user.id}
                  onUserClick={handleUserClick}
                  className="font-medium text-card-foreground"
                />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(highlight.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            
            {/* Quote */}
            <div className="relative">
              <blockquote className="border-l-4 border-primary pl-4 italic text-card-foreground text-lg leading-relaxed">
                "{highlight.quote_text}"
              </blockquote>
            </div>
            
            <Separator />
            
            {/* Book Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{highlight.book_title}</span>
              </div>
              
              {highlight.book_author && (
                <span>by {highlight.book_author}</span>
              )}
              
              {highlight.page_number && (
                <Badge variant="outline" className="text-xs">
                  Page {highlight.page_number}
                </Badge>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(highlight.id)}
                  className={`flex items-center gap-2 ${
                    highlight.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${highlight.is_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{highlight.likes_count}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{highlight.comments_count}</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyQuote(highlight.quote_text)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(highlight)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <UserProfileView
        isOpen={userProfileView.isOpen}
        onClose={() => setUserProfileView({ isOpen: false, userId: null })}
        userId={userProfileView.userId}
      />
    </div>
  );
};