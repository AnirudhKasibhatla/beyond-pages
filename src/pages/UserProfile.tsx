import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useHighlightFollows } from "@/hooks/useHighlightFollows";
import { useUserFollows } from "@/hooks/useUserFollows";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Book, Award, TrendingUp, Star, UserPlus, UserMinus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserHighlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author: string;
  page_number: string;
  created_at: string;
}

interface UserBook {
  id: string;
  title: string;
  author: string;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  status: string;
  progress: string | null;
  cover_url: string | null;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile(userId);
  const { follows, toggleFollow: toggleHighlightFollow, isFollowing, loading: followLoading } = useHighlightFollows();
  const { isFollowing: isFollowingUser, followerCount, followingCount, loading: userFollowLoading, toggleFollow: toggleUserFollow } = useUserFollows(userId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [readingBooks, setReadingBooks] = useState<UserBook[]>([]);
  const [readingBooksLoading, setReadingBooksLoading] = useState(true);
  const [showAllBooks, setShowAllBooks] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        // Fetch highlights
        const { data: highlightsData, error: highlightsError } = await supabase
          .from('highlights')
          .select('id, quote_text, book_title, book_author, page_number, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (highlightsError) throw highlightsError;
        setHighlights(highlightsData || []);

        // Fetch all books
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('id, title, author, rating, review_text, created_at, status, progress, genres, cover_url')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (booksError) throw booksError;
        
        // Separate books by status
        const allBooks = booksData || [];
        setBooks(allBooks.filter(book => book.status === 'finished'));
        setReadingBooks(allBooks.filter(book => book.status === 'reading'));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setHighlightsLoading(false);
        setBooksLoading(false);
        setReadingBooksLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">User not found</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Profile not found or not public</p>
        </Card>
      </div>
    );
  }

  const getLeague = (level: number) => {
    if (level >= 50) return "Diamond";
    if (level >= 30) return "Platinum";
    if (level >= 15) return "Gold";
    if (level >= 5) return "Silver";
    return "Bronze";
  };

  const currentLevel = 1; // Default level
  const xpForNextLevel = 100;
  const currentXP = 0;
  const xpProgress = (currentXP / xpForNextLevel) * 100;

  const renderStatCard = (icon: React.ReactNode, label: string, value: string | number) => (
    <Card className="p-4 text-center">
      <div className="flex flex-col items-center gap-2">
        {icon}
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 cursor-pointer" onClick={() => navigate(`/user/${userId}`)}>
            <AvatarImage src={profile.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{profile.name || 'Anonymous'}</h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-3">@{profile.username}</p>
                )}
              </div>
              {currentUserId && currentUserId !== userId && (
                <Button
                  onClick={toggleUserFollow}
                  disabled={userFollowLoading}
                  variant={isFollowingUser ? "outline" : "default"}
                >
                  {isFollowingUser ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-card-foreground mb-4">{profile.bio}</p>
            )}
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{followerCount}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">{followingCount}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Level {currentLevel}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {getLeague(currentLevel)} League
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {renderStatCard(
          <Book className="h-6 w-6 text-primary" />,
          "Books Read",
          books.length
        )}
        {renderStatCard(
          <TrendingUp className="h-6 w-6 text-primary" />,
          "Currently Reading",
          readingBooks.length
        )}
        {renderStatCard(
          <Star className="h-6 w-6 text-primary" />,
          "Highlights Shared",
          highlights.length
        )}
      </div>

      {/* Currently Reading Library */}
      {readingBooks.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/20">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Currently Reading
          </h2>
          {readingBooksLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {readingBooks.map((book) => (
                <div key={book.id} className="relative group">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">{book.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{book.author}</p>
                      </div>
                    )}
                  </div>
                  {book.progress && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] text-center py-0.5 rounded-b-lg">
                      {book.progress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Books & Reviews */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/20">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Books & Reviews
        </h2>
        {booksLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {(showAllBooks ? books : books.slice(0, 10)).map((book) => (
                <div key={book.id} className="relative group">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex flex-col overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                    {book.cover_url ? (
                      <div className="flex-1 relative">
                        <img 
                          src={book.cover_url} 
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                        {book.rating && (
                          <div className="absolute top-2 right-2 bg-background/90 rounded px-2 py-1 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{book.rating}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-3">
                        <p className="text-xs font-medium text-foreground line-clamp-3 mb-2 text-center">{book.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 text-center">{book.author}</p>
                        {book.rating && (
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {book.review_text && (
                      <div className="w-full bg-primary/10 text-[10px] text-center py-1 px-2">
                        <p className="line-clamp-2 text-foreground">{book.review_text}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {books.length > 10 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllBooks(!showAllBooks)}
                  className="w-full md:w-auto"
                >
                  {showAllBooks ? 'View Less' : `View More (${books.length - 10} more)`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No books reviewed yet</p>
        )}
      </Card>

      {/* Shared Highlights */}
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          Shared Highlights
        </h2>
        {highlightsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : highlights.length > 0 ? (
          <div className="space-y-4">
            {highlights.map((highlight) => {
              const following = isFollowing(highlight.id);
              return (
                <Card key={highlight.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {highlight.book_title}
                        {highlight.book_author && ` by ${highlight.book_author}`}
                      </p>
                      <blockquote className="text-card-foreground italic border-l-2 border-border pl-4 mb-2">
                        "{highlight.quote_text}"
                      </blockquote>
                      {highlight.page_number && (
                        <p className="text-xs text-muted-foreground">Page {highlight.page_number}</p>
                      )}
                    </div>
                    <Button
                      variant={following ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleHighlightFollow(highlight.id)}
                      disabled={followLoading}
                    >
                      <Star className={`h-4 w-4 mr-1 ${following ? 'fill-current' : ''}`} />
                      {following ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No highlights shared yet</p>
        )}
      </Card>
    </div>
  );
}
