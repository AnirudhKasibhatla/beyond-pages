import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useHighlightFollows } from "@/hooks/useHighlightFollows";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Book, Award, TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserHighlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author: string;
  page_number: string;
  created_at: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile(userId);
  const { follows, toggleFollow, isFollowing, loading: followLoading } = useHighlightFollows();
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  useEffect(() => {
    const fetchUserHighlights = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('highlights')
          .select('id, quote_text, book_title, book_author, page_number, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHighlights(data || []);
      } catch (error) {
        console.error('Error fetching user highlights:', error);
      } finally {
        setHighlightsLoading(false);
      }
    };

    fetchUserHighlights();
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
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-1">{profile.name || 'Anonymous'}</h1>
            {profile.username && (
              <p className="text-muted-foreground mb-3">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="text-card-foreground mb-4">{profile.bio}</p>
            )}
            
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
          0
        )}
        {renderStatCard(
          <Award className="h-6 w-6 text-accent" />,
          "Badges Earned",
          0
        )}
        {renderStatCard(
          <TrendingUp className="h-6 w-6 text-success" />,
          "Reading Streak",
          "0 days"
        )}
      </div>

      {/* Favorite Genres */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Favorite Genres</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">No data</Badge>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <p className="text-muted-foreground">No badges earned yet</p>
        </div>
      </Card>

      {/* Shared Highlights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Shared Highlights</h2>
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
                      onClick={() => toggleFollow(highlight.id)}
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
