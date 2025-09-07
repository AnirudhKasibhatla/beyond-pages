import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { User, Trophy, Star, Book, ArrowLeft, Quote, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { useHighlights } from "@/hooks/useHighlights";
import { useHighlightFollows } from "@/hooks/useHighlightFollows";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import badgeImage from "@/assets/badge-reading.png";

interface UserProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserHighlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author: string;
  page_number: string;
  created_at: string;
}

export const UserProfileView = ({ isOpen, onClose, userId }: UserProfileViewProps) => {
  const { profile, loading } = useProfile(userId || undefined);
  const [userHighlights, setUserHighlights] = useState<UserHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const { follows, toggleFollow, isFollowing } = useHighlightFollows();
  const { toast } = useToast();

  // Mock data for demonstration
  const mockStats = {
    booksRead: 25,
    currentStreak: 12,
    xp: 1250,
    level: 8,
    badges: ['First Steps', 'Bookworm', 'Speed Reader']
  };

  const mockGenres = ['Fantasy', 'Science Fiction', 'Mystery'];

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserHighlights();
    }
  }, [isOpen, userId]);

  const fetchUserHighlights = async () => {
    if (!userId) return;
    
    setHighlightsLoading(true);
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserHighlights(data || []);
    } catch (error) {
      console.error('Error fetching user highlights:', error);
    } finally {
      setHighlightsLoading(false);
    }
  };

  const handleFollowHighlight = async (highlightId: string) => {
    try {
      await toggleFollow(highlightId);
    } catch (error) {
      console.error('Error following highlight:', error);
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, color = 'primary') => (
    <Card className="p-4 text-center hover:shadow-medium transition-all duration-300 bg-gradient-card">
      <div className={`inline-flex p-3 rounded-full bg-${color}/10 mb-3`}>
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-card-foreground">{value}</h4>
      <p className="text-sm text-muted-foreground">{title}</p>
    </Card>
  );

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            Loading profile...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            Profile not found
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Calculate XP progress
  const xpForCurrentLevel = (mockStats.level - 1) * 50 + 50;
  const xpForNextLevel = mockStats.level * 50 + 50;
  const xpProgress = ((mockStats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // League calculation
  const getLeague = (level: number) => {
    if (level >= 25) return { name: 'Platinum', color: 'bg-slate-300' };
    if (level >= 20) return { name: 'Diamond', color: 'bg-blue-400' };
    if (level >= 15) return { name: 'Gold', color: 'bg-yellow-400' };
    if (level >= 10) return { name: 'Silver', color: 'bg-gray-300' };
    return { name: 'Copper', color: 'bg-orange-400' };
  };

  const currentLeague = getLeague(mockStats.level);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl">
              {profile.name}'s Profile
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card shadow-medium">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-bold text-card-foreground">{profile.name}</h3>
                  {profile.username && (
                    <p className="text-muted-foreground text-sm">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-muted-foreground text-sm mt-2">{profile.bio}</p>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Level {mockStats.level}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`gap-1 ${currentLeague.color} text-white border-none`}
                  >
                    {currentLeague.name} League
                  </Badge>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{mockStats.xp} XP</span>
                    <span>{xpForNextLevel} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {xpForNextLevel - mockStats.xp} XP to next level
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reading Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderStatCard("Books Read", mockStats.booksRead, <Book className="h-6 w-6 text-primary" />)}
              {renderStatCard("Current Streak", `${mockStats.currentStreak} days`, <Star className="h-6 w-6 text-accent" />)}
              {renderStatCard("Total XP", mockStats.xp, <Trophy className="h-6 w-6 text-success" />)}
              {renderStatCard("Highlights", userHighlights.length, <Quote className="h-6 w-6 text-accent" />)}
            </div>

            {/* Favorite Genres */}
            <Card className="p-6 bg-gradient-card shadow-medium">
              <h4 className="text-lg font-semibold mb-4 text-card-foreground">Favorite Genres</h4>
              <div className="flex flex-wrap gap-2">
                {mockGenres.map((genre) => (
                  <Badge key={genre} variant="default" className="text-sm px-3 py-1">
                    {genre}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Badges & Achievements */}
            <Card className="p-6 bg-gradient-card shadow-medium">
              <h4 className="text-lg font-semibold mb-4 text-card-foreground">Badges & Achievements</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockStats.badges.map((badge) => (
                  <div key={badge} className="text-center p-4 rounded-lg bg-secondary/50">
                    <img 
                      src={badgeImage} 
                      alt={badge}
                      className="h-12 w-12 mx-auto mb-2 object-contain"
                    />
                    <p className="text-sm font-medium text-card-foreground">{badge}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* User Highlights */}
            <Card className="p-6 bg-gradient-card shadow-medium">
              <h4 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Highlights ({userHighlights.length})
              </h4>
              
              {highlightsLoading ? (
                <div className="text-center py-4">Loading highlights...</div>
              ) : userHighlights.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userHighlights.map((highlight) => (
                    <Card key={highlight.id} className="p-4 border-l-4 border-l-primary">
                      <blockquote className="text-card-foreground italic mb-2">
                        "{highlight.quote_text}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">{highlight.book_title}</p>
                          {highlight.book_author && <p>by {highlight.book_author}</p>}
                          {highlight.page_number && <p>Page {highlight.page_number}</p>}
                        </div>
                        <Button
                          variant={isFollowing(highlight.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFollowHighlight(highlight.id)}
                          className="gap-2"
                        >
                          <Heart className={`h-4 w-4 ${isFollowing(highlight.id) ? 'fill-current' : ''}`} />
                          {isFollowing(highlight.id) ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No highlights shared yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};