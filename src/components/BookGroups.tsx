import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Book, MessageCircle, Plus, UserPlus, Check, Filter, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { GroupChat } from "./GroupChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BookGroup {
  id: string;
  name: string;
  genre: string;
  memberCount: number;
  location: string;
  type: 'local' | 'online' | 'hybrid';
  isJoined: boolean;
  currentBook: string;
  privacy: 'public' | 'private';
  activityLevel: 'low' | 'moderate' | 'high';
}

export const BookGroups = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BookGroup | null>(null);
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [groups, setGroups] = useState<BookGroup[]>([]);
  const [userMemberships, setUserMemberships] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load groups from database
  useEffect(() => {
    loadGroups();
    if (user) {
      loadUserMemberships();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('book_groups')
        .select('*')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithMemberships = await Promise.all(
        data.map(async (group) => {
          const { data: memberData } = await supabase
            .from('group_memberships')
            .select('id')
            .eq('group_id', group.id);

          return {
            id: group.id,
            name: group.name,
            genre: group.genre || 'General',
            memberCount: memberData?.length || 1,
            location: group.location,
            type: group.type as 'local' | 'online' | 'hybrid',
            isJoined: false, // Will be updated with user memberships
            currentBook: group.current_book || 'No current book',
            privacy: group.privacy as 'public' | 'private',
            activityLevel: group.activity_level as 'low' | 'moderate' | 'high'
          };
        })
      );

      setGroups(groupsWithMemberships);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMemberships = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const memberGroupIds = data.map(membership => membership.group_id);
      setUserMemberships(memberGroupIds);
      
      // Update groups with membership status
      setGroups(prev => prev.map(group => ({
        ...group,
        isJoined: memberGroupIds.includes(group.id)
      })));
    } catch (error) {
      console.error('Error loading user memberships:', error);
    }
  };

  const toggleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join groups.",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyJoined = userMemberships.includes(groupId);

    try {
      if (isCurrentlyJoined) {
        // Leave group
        const { error } = await supabase
          .from('group_memberships')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error) throw error;

        setUserMemberships(prev => prev.filter(id => id !== groupId));
        setGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
            : group
        ));

        toast({
          title: "Left Group",
          description: "You've left the group successfully.",
        });
      } else {
        // Join group
        const { error } = await supabase
          .from('group_memberships')
          .insert({
            group_id: groupId,
            user_id: user.id
          });

        if (error) throw error;

        setUserMemberships(prev => [...prev, groupId]);
        setGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
            : group
        ));

        toast({
          title: "Joined Group!",
          description: "Welcome to the group! You earned 10 XP.",
        });
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      toast({
        title: "Error",
        description: "Failed to update group membership. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: BookGroup['type']) => {
    switch (type) {
      case 'local':
        return <MapPin className="h-4 w-4" />;
      case 'online':
        return <Globe className="h-4 w-4" />;
      case 'hybrid':
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getActivityColor = (level: BookGroup['activityLevel']) => {
    switch (level) {
      case 'high':
        return 'bg-success text-success-foreground';
      case 'moderate':
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
      'General': 'bg-gray-500 text-white',
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const filteredGroups = groups.filter(group => {
    if (genreFilter !== "all" && group.genre !== genreFilter) return false;
    if (typeFilter !== "all" && group.type !== typeFilter) return false;
    if (activityFilter !== "all" && group.activityLevel !== activityFilter) return false;
    return true;
  });

  const cityGroups = filteredGroups.filter(g => g.type === 'local' || g.type === 'hybrid');
  const onlineGroups = filteredGroups.filter(g => g.type === 'online' || g.type === 'hybrid');

  if (loading) {
    return <div className="flex justify-center items-center py-8">Loading groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Book Groups</h2>
        <Button variant="hero" className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Filter Options */}
      <Card className="p-4 bg-gradient-card">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filter Groups</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Genre</label>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Mystery">Mystery</SelectItem>
                <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                <SelectItem value="Literary Fiction">Literary Fiction</SelectItem>
                <SelectItem value="Young Adult">Young Adult</SelectItem>
                <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Activity</label>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="high">High Activity</SelectItem>
                <SelectItem value="moderate">Moderate Activity</SelectItem>
                <SelectItem value="low">Low Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* My Groups Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Users className="h-6 w-6 text-primary mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">My Groups</h4>
          <p className="text-2xl font-bold text-primary">{groups.filter(g => g.isJoined).length}</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <MessageCircle className="h-6 w-6 text-accent mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Active Groups</h4>
          <p className="text-2xl font-bold text-accent">
            {groups.filter(g => g.isJoined && g.activityLevel === 'high').length}
          </p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Book className="h-6 w-6 text-success mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Total Groups</h4>
          <p className="text-2xl font-bold text-success">{groups.length}</p>
        </Card>
      </div>

      {/* My Memberships */}
      {groups.filter(g => g.isJoined).length > 0 && (
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
                <p className="text-xs opacity-75">
                  Currently reading: "{group.currentBook}"
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Groups in the City */}
      {cityGroups.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Local Groups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cityGroups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                       <h4 
                         className="text-lg font-semibold text-card-foreground mb-2 cursor-pointer hover:text-primary transition-colors" 
                         onClick={() => group.isJoined && setSelectedGroup(group)}
                       >
                         {group.name}
                       </h4>
                       <p className="text-muted-foreground text-sm">{group.genre} group</p>
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

                  <Card className="p-3 bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="font-medium">Currently reading:</span>
                        <p className="text-muted-foreground">
                          "{group.currentBook}"
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.memberCount} members
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {group.location}
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
      )}

      {/* Online Groups */}
      {onlineGroups.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6" /> Online Communities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onlineGroups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                       <h4 
                         className="text-lg font-semibold text-card-foreground mb-2 cursor-pointer hover:text-primary transition-colors" 
                         onClick={() => group.isJoined && setSelectedGroup(group)}
                       >
                         {group.name}
                       </h4>
                       <p className="text-muted-foreground text-sm">{group.genre} group</p>
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

                  <Card className="p-3 bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="font-medium">Currently reading:</span>
                        <p className="text-muted-foreground">
                          "{group.currentBook}"
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.memberCount} members
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {group.location}
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
      )}

      {/* Create Group CTA */}
      {groups.length === 0 && !loading && (
        <Card className="p-8 text-center bg-gradient-accent shadow-medium">
          <h3 className="text-xl font-semibold text-accent-foreground mb-3">
            Start the First Book Group
          </h3>
          <p className="text-accent-foreground/80 mb-6 max-w-2xl mx-auto">
            Be the first to create a book group in your community! Connect with fellow readers,
            discover new books, and share your love of literature.
          </p>
          <Button variant="hero" size="lg" className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-5 w-5" />
            Create First Group
          </Button>
        </Card>
      )}

      {/* Create Group Dialog */}
      <CreateGroupDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      
      {/* Group Chat Modal */}
      {selectedGroup && (
        <GroupChat 
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};