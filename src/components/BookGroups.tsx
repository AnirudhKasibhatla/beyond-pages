import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin, Book, MessageCircle, Plus, UserPlus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";

interface BookGroup {
  id: string;
  name: string;
  description: string;
  genre: string;
  memberCount: number;
  maxMembers?: number;
  location: string;
  type: 'local' | 'online' | 'hybrid';
  isJoined: boolean;
  lastActivity: string;
  currentBook?: {
    title: string;
    author: string;
  };
  privacy: 'public' | 'private';
  activityLevel: 'high' | 'medium' | 'low';
}

export const BookGroups = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createSectionRef = useRef<HTMLDivElement>(null);
  const [groups, setGroups] = useState<BookGroup[]>([
    {
      id: '1',
      name: 'Mystery Lovers Society',
      description: 'A passionate community of mystery and thriller enthusiasts. We dive deep into plot twists, character motivations, and the art of suspense.',
      genre: 'Mystery',
      memberCount: 47,
      maxMembers: 50,
      location: 'Downtown Library',
      type: 'local',
      isJoined: true,
      lastActivity: '2 hours ago',
      currentBook: {
        title: 'The Thursday Murder Club',
        author: 'Richard Osman'
      },
      privacy: 'public',
      activityLevel: 'high'
    },
    {
      id: '2',
      name: 'Sci-Fi Explorers',
      description: 'Journey through galaxies far, far away with fellow science fiction fans. From classic Asimov to modern Liu Cixin, we explore it all.',
      genre: 'Science Fiction',
      memberCount: 156,
      location: 'Virtual (Discord)',
      type: 'online',
      isJoined: false,
      lastActivity: '30 minutes ago',
      currentBook: {
        title: 'Project Hail Mary',
        author: 'Andy Weir'
      },
      privacy: 'public',
      activityLevel: 'high'
    },
    {
      id: '3',
      name: 'Literary Fiction Circle',
      description: 'For those who appreciate the beauty of language and the depth of human experience in contemporary and classic literature.',
      genre: 'Literary Fiction',
      memberCount: 23,
      maxMembers: 30,
      location: 'Coffee Shop on Main St',
      type: 'local',
      isJoined: true,
      lastActivity: '1 day ago',
      currentBook: {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro'
      },
      privacy: 'public',
      activityLevel: 'medium'
    },
    {
      id: '4',
      name: 'Young Adult Adventures',
      description: 'Embracing the excitement, romance, and coming-of-age stories that make YA literature so compelling.',
      genre: 'Young Adult',
      memberCount: 89,
      location: 'Community Center',
      type: 'hybrid',
      isJoined: false,
      lastActivity: '4 hours ago',
      privacy: 'public',
      activityLevel: 'high'
    },
    {
      id: '5',
      name: 'Non-Fiction Knowledge Hub',
      description: 'Dedicated to expanding our understanding of the world through biographies, history, science, and self-improvement books.',
      genre: 'Non-Fiction',
      memberCount: 67,
      location: 'Virtual (Zoom)',
      type: 'online',
      isJoined: false,
      lastActivity: '6 hours ago',
      currentBook: {
        title: 'Sapiens',
        author: 'Yuval Noah Harari'
      },
      privacy: 'public',
      activityLevel: 'medium'
    },
    {
      id: '6',
      name: 'Romance Readers United',
      description: 'A warm and welcoming space for romance lovers to discuss swoon-worthy characters, epic love stories, and everything in between.',
      genre: 'Romance',
      memberCount: 134,
      location: 'Bookstore Café',
      type: 'local',
      isJoined: true,
      lastActivity: '3 days ago',
      privacy: 'public',
      activityLevel: 'low'
    }
  ]);

  const [myGroups] = useState([
    'Mystery Lovers Society',
    'Literary Fiction Circle', 
    'Romance Readers United'
  ]);

  const { toast } = useToast();

  const scrollToCreateSection = () => {
    createSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const toggleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            isJoined: !group.isJoined,
            memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1
          }
        : group
    ));

    const group = groups.find(g => g.id === groupId);
    if (group) {
      toast({
        title: group.isJoined ? "Left Group" : "Joined Group!",
        description: group.isJoined 
          ? `You've left "${group.name}"` 
          : `Welcome to "${group.name}"! You earned 10 XP!`,
      });
    }
  };

  const getTypeIcon = (type: BookGroup['type']) => {
    switch (type) {
      case 'local':
        return '📍';
      case 'online':
        return '💻';
      case 'hybrid':
        return '🔄';
    }
  };

  const getActivityColor = (level: BookGroup['activityLevel']) => {
    switch (level) {
      case 'high':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getGenreColor = (genre: string) => {
    const colors = {
      'Mystery': 'bg-purple-500 text-white',
      'Science Fiction': 'bg-blue-500 text-white',
      'Literary Fiction': 'bg-emerald-500 text-white',
      'Young Adult': 'bg-pink-500 text-white',
      'Non-Fiction': 'bg-orange-500 text-white',
      'Romance': 'bg-red-500 text-white',
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const formatLastActivity = (activity: string) => {
    return `Last active: ${activity}`;
  };

  const cityGroups = groups.filter(g => g.type === 'local' || g.type === 'hybrid');
  const onlineGroups = groups.filter(g => g.type === 'online' || g.type === 'hybrid');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Book Groups</h2>
        <Button variant="hero" className="gap-2" onClick={scrollToCreateSection}>
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* My Groups Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Users className="h-6 w-6 text-primary mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">My Groups</h4>
          <p className="text-2xl font-bold text-primary">{groups.filter(g => g.isJoined).length}</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <MessageCircle className="h-6 w-6 text-accent mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Active Discussions</h4>
          <p className="text-2xl font-bold text-accent">
            {groups.filter(g => g.isJoined && g.activityLevel === 'high').length}
          </p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Book className="h-6 w-6 text-success mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Books Reading</h4>
          <p className="text-2xl font-bold text-success">
            {groups.filter(g => g.isJoined && g.currentBook).length}
          </p>
        </Card>
      </div>

      {/* My Memberships */}
      <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-medium">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="text-primary bg-primary-foreground">
            My Groups
          </Badge>
          Current Memberships
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.filter(g => g.isJoined).map((group) => (
            <div key={group.id} className="bg-primary-foreground/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{group.name}</h4>
              <p className="text-sm opacity-90 mb-2">{group.memberCount} members</p>
              {group.currentBook && (
                <p className="text-xs opacity-75">
                  Currently reading: "{group.currentBook.title}"
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Groups in the City */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Groups in Your City
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cityGroups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">{group.name}</h4>
                    <p className="text-muted-foreground text-sm line-clamp-3">{group.description}</p>
                  </div>
                  <Badge className={getActivityColor(group.activityLevel)}>
                    {group.activityLevel} activity
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getGenreColor(group.genre)}>
                    {group.genre}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeIcon(group.type)} {group.type}
                  </Badge>
                </div>

                {group.currentBook && (
                  <Card className="p-3 bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="font-medium">Currently reading:</span>
                        <p className="text-muted-foreground">
                          "{group.currentBook.title}" by {group.currentBook.author}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {group.memberCount} members
                    {group.maxMembers && ` / ${group.maxMembers}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {group.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {formatLastActivity(group.lastActivity)}
                  </div>
                </div>

                <Button 
                  variant={group.isJoined ? "outline" : "default"}
                  onClick={() => toggleJoinGroup(group.id)}
                  className="w-full gap-2"
                  disabled={group.maxMembers && group.memberCount >= group.maxMembers && !group.isJoined}
                >
                  {group.isJoined ? (
                    <>
                      <Check className="h-4 w-4" />
                      Joined
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Join Group
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Online Groups */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          💻 Online Communities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {onlineGroups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">{group.name}</h4>
                    <p className="text-muted-foreground text-sm line-clamp-3">{group.description}</p>
                  </div>
                  <Badge className={getActivityColor(group.activityLevel)}>
                    {group.activityLevel} activity
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getGenreColor(group.genre)}>
                    {group.genre}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeIcon(group.type)} {group.type}
                  </Badge>
                </div>

                {group.currentBook && (
                  <Card className="p-3 bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="font-medium">Currently reading:</span>
                        <p className="text-muted-foreground">
                          "{group.currentBook.title}" by {group.currentBook.author}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {group.memberCount} members
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {group.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {formatLastActivity(group.lastActivity)}
                  </div>
                </div>

                <Button 
                  variant={group.isJoined ? "outline" : "default"}
                  onClick={() => toggleJoinGroup(group.id)}
                  className="w-full gap-2"
                >
                  {group.isJoined ? (
                    <>
                      <Check className="h-4 w-4" />
                      Joined
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Join Group
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Group CTA */}
      <Card ref={createSectionRef} className="p-8 text-center bg-gradient-accent shadow-medium">
        <h3 className="text-xl font-semibold text-accent-foreground mb-3">
          Start Your Own Book Group
        </h3>
        <p className="text-accent-foreground/80 mb-6 max-w-2xl mx-auto">
          Can't find the perfect group for your interests? Create your own! 
          Bring together readers who share your passion and build a thriving literary community.
        </p>
        <Button variant="hero" size="lg" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Create New Group
        </Button>
      </Card>

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};