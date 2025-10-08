import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  name: string | null;
  username: string | null;
  profile_picture_url: string | null;
}

interface BookReview {
  id: string;
  user_id: string;
  title: string;
  author: string;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  cover_url: string | null;
  user_name: string | null;
  user_profile?: UserProfile;
}

export default function BookDetails() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookReview | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(window.location.search);
  const titleParam = searchParams.get('title');
  const authorParam = searchParams.get('author');

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId && !titleParam) {
        setLoading(false);
        return;
      }

      try {
        let bookData;
        let bookError;

        console.log('Fetching book details:', { bookId, titleParam, authorParam });

        if (bookId) {
          // Fetch by book ID
          const result = await supabase
            .from('books')
            .select('*')
            .eq('id', bookId)
            .maybeSingle();
          bookData = result.data;
          bookError = result.error;
        } else if (titleParam && authorParam) {
          // Fetch by title and author
          const result = await supabase
            .from('books')
            .select('*')
            .eq('title', titleParam)
            .eq('author', authorParam)
            .limit(1)
            .maybeSingle();
          bookData = result.data;
          bookError = result.error;
        }

        if (bookError) {
          console.error('Error fetching book:', bookError);
          throw bookError;
        }

        if (!bookData) {
          console.log('No book data found');
          setLoading(false);
          return;
        }

        console.log('Book data found:', bookData);

        // Fetch user profile for the book owner
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, username, profile_picture_url')
          .eq('user_id', bookData.user_id)
          .maybeSingle();

        setBook({ ...bookData, user_profile: profileData || undefined });

        // Fetch all reviews for this book (same title and author)
        if (bookData) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('books')
            .select('*')
            .eq('title', bookData.title)
            .eq('author', bookData.author)
            .eq('status', 'finished')
            .not('review_text', 'is', null)
            .order('created_at', { ascending: false });

          if (reviewsError) throw reviewsError;

          // Fetch profiles for all reviewers
          const userIds = reviewsData?.map(r => r.user_id) || [];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, name, username, profile_picture_url')
            .in('user_id', userIds);

          const reviewsWithProfiles = reviewsData?.map(review => ({
            ...review,
            user_profile: profilesData?.find(p => p.user_id === review.user_id)
          })) || [];

          setReviews(reviewsWithProfiles);
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, titleParam, authorParam]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Book not found</p>
        </Card>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.filter(r => r.rating).length
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Book Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-48 h-72 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-48 h-72 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">No cover</span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
            
            {averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-foreground font-semibold">
                  {averageRating.toFixed(1)} / 5.0
                </span>
                <span className="text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
        
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar 
                  className="h-12 w-12 cursor-pointer" 
                  onClick={() => navigate(`/user/${review.user_id}`)}
                >
                  <AvatarImage src={review.user_profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {review.user_profile?.name?.charAt(0).toUpperCase() || review.user_name?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p 
                        className="font-semibold text-foreground cursor-pointer hover:underline"
                        onClick={() => navigate(`/user/${review.user_id}`)}
                      >
                        {review.user_profile?.name || review.user_name || 'Anonymous'}
                      </p>
                      {review.user_profile?.username && (
                        <p className="text-sm text-muted-foreground">@{review.user_profile.username}</p>
                      )}
                    </div>
                    
                    {review.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {review.review_text && (
                    <p className="text-card-foreground whitespace-pre-wrap">{review.review_text}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reviews yet for this book</p>
          </Card>
        )}
      </div>
    </div>
  );
}
