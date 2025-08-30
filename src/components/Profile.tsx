import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { User, Trophy, Star, Book, Edit, Save, X, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HighlightsList } from "@/components/HighlightsList";
import { EditUsernameDialog } from "./EditUsernameDialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import badgeImage from "@/assets/badge-reading.png";

interface UserProfile {
  name: string;
  bio: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  profilePicUrl: string;
  xp: number;
  level: number;
  isPublic: boolean;
  favoriteGenres: string[];
  badges: string[];
  booksRead: number;
  currentStreak: number;
}

export const Profile = () => {
  const { user } = useAuth();
  const { profile: dbProfile, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Guest Reader',
    bio: 'Welcome to your reading journey! Edit your profile to get started.',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: ''
    },
    profilePicUrl: '',
    xp: 0,
    level: 1,
    isPublic: true,
    favoriteGenres: [],
    badges: [],
    booksRead: 0,
    currentStreak: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);

  // Update profile when database profile changes
  useEffect(() => {
    if (dbProfile) {
      const updatedProfile: UserProfile = {
        ...profile,
        name: dbProfile.name || dbProfile.first_name || 'Guest Reader',
        bio: dbProfile.bio || 'Welcome to your reading journey! Edit your profile to get started.',
      };
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
    } else {
      // Load profile from localStorage for non-authenticated users
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setEditForm(parsed);
      }
    }
  }, [dbProfile]);

  // Calculate XP progress to next level
  const xpForCurrentLevel = (profile.level - 1) * 50 + 50; // 50 XP for level 1, then +50 per level
  const xpForNextLevel = profile.level * 50 + 50;
  const xpProgress = ((profile.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // League calculation
  const getLeague = (level: number) => {
    if (level >= 25) return { name: 'Platinum', color: 'bg-slate-300' };
    if (level >= 20) return { name: 'Diamond', color: 'bg-blue-400' };
    if (level >= 15) return { name: 'Gold', color: 'bg-yellow-400' };
    if (level >= 10) return { name: 'Silver', color: 'bg-gray-300' };
    return { name: 'Copper', color: 'bg-orange-400' };
  };

  const currentLeague = getLeague(profile.level);

  const handleSave = async () => {
    if (user && dbProfile) {
      // Save to database for authenticated users
      const { error } = await updateProfile({
        name: editForm.name,
        bio: editForm.bio,
        first_name: editForm.name.split(' ')[0] || '',
        last_name: editForm.name.split(' ').slice(1).join(' ') || '',
      });

      if (error) {
        toast({
          title: "Error updating profile",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('userProfile', JSON.stringify(editForm));
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved locally.",
      });
    }
    
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-gradient-card shadow-medium">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile.profilePicUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2">
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Your name"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={`@${dbProfile?.username || ''}`}
                      disabled
                      className="opacity-50 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUsernameDialog(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-card-foreground">{profile.name}</h3>
                  {dbProfile?.username && (
                    <p className="text-muted-foreground text-sm">@{dbProfile.username}</p>
                  )}
                  <p className="text-muted-foreground text-sm">{profile.bio}</p>
                </>
              )}

              <div className="flex justify-center gap-2">
                <Badge variant="default" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  Level {profile.level}
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
                  <span>{profile.xp} XP</span>
                  <span>{xpForNextLevel} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {xpForNextLevel - profile.xp} XP to next level
                </p>
              </div>

              {/* Privacy Toggle */}
              {isEditing && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Label htmlFor="privacy" className="text-sm">Public Profile</Label>
                  <Switch
                    id="privacy"
                    checked={editForm.isPublic}
                    onCheckedChange={(checked) => setEditForm({...editForm, isPublic: checked})}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Social Media Links */}
          {isEditing && (
            <Card className="p-4 mt-4 bg-gradient-card">
              <h4 className="font-semibold mb-3">Social Media</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Facebook URL"
                  value={editForm.socialMedia.facebook}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    socialMedia: {...editForm.socialMedia, facebook: e.target.value}
                  })}
                />
                <Input
                  placeholder="Twitter URL"
                  value={editForm.socialMedia.twitter}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    socialMedia: {...editForm.socialMedia, twitter: e.target.value}
                  })}
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={editForm.socialMedia.linkedin}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    socialMedia: {...editForm.socialMedia, linkedin: e.target.value}
                  })}
                />
              </div>
            </Card>
          )}

          {isEditing && (
            <div className="flex gap-2 mt-4">
              <Button variant="hero" onClick={handleSave} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reading Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderStatCard("Books Read", profile.booksRead, <Book className="h-6 w-6 text-primary" />)}
            {renderStatCard("Current Streak", `${profile.currentStreak} days`, <Star className="h-6 w-6 text-accent" />)}
            {renderStatCard("Total XP", profile.xp, <Trophy className="h-6 w-6 text-success" />)}
            {renderStatCard("Badges Earned", profile.badges.length, <Star className="h-6 w-6 text-accent" />)}
          </div>

          {/* Favorite Genres */}
          <Card className="p-6 bg-gradient-card shadow-medium">
            <h4 className="text-lg font-semibold mb-4 text-card-foreground">Favorite Genres</h4>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGenres.map((genre) => (
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
              {profile.badges.map((badge) => (
                <div key={badge} className="text-center p-4 rounded-lg bg-secondary/50 hover:shadow-soft transition-all duration-300">
                  <img 
                    src={badgeImage} 
                    alt={badge}
                    className="h-12 w-12 mx-auto mb-2 object-contain"
                  />
                  <p className="text-sm font-medium text-card-foreground">{badge}</p>
                </div>
              ))}
              <div className="text-center p-4 rounded-lg bg-muted/50 border-2 border-dashed border-border">
                <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Star className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">More badges coming soon!</p>
              </div>
            </div>
          </Card>

          {/* Reading Goals moved to Reading Challenges tab */}

          {/* Highlights Section */}
          <HighlightsList />
        </div>
      </div>

      <EditUsernameDialog 
        isOpen={showUsernameDialog}
        onClose={() => setShowUsernameDialog(false)}
      />
    </div>
  );
};