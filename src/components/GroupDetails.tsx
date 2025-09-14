import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MessageCircle, BookOpen, MapPin, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GroupChat } from "./GroupChat";
import { GroupMembers } from "./GroupMembers";
import { ClickableUserName } from "./ClickableUserName";

interface GroupDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onViewProfile: (userId: string) => void;
}

interface Group {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  location: string;
  type: string;
  genre: string;
  current_book: string;
  activity_level: string;
  current_members: number;
  total_slots: number;
  created_at: string;
}

interface GroupPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    name: string;
    username: string;
    profile_picture_url: string | null;
  };
}

export const GroupDetails = ({ isOpen, onClose, groupId, onViewProfile }: GroupDetailsProps) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'members'>('details');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupDetails();
      fetchGroupPosts();
    }
  }, [isOpen, groupId]);

  const fetchGroupDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('book_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      // For now, we'll show a placeholder since we don't have group posts table
      // This would be implemented with a proper group_posts table
      setPosts([]);
    } catch (error) {
      console.error('Error fetching group posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !group) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            Loading group details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-xl">{group.name}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary">
                  {group.genre}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {group.type}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {group.activity_level}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'details' ? 'default' : 'outline'}
            onClick={() => setActiveTab('details')}
            size="sm"
          >
            Details
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            variant={activeTab === 'members' ? 'default' : 'outline'}
            onClick={() => setActiveTab('members')}
            size="sm"
          >
            <Users className="h-4 w-4 mr-1" />
            Members
          </Button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Group Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{group.current_members}/{group.total_slots} members</p>
                      <p className="text-sm text-muted-foreground">Current membership</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{group.location}</p>
                      <p className="text-sm text-muted-foreground">Location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{group.genre}</p>
                      <p className="text-sm text-muted-foreground">Genre preference</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{group.activity_level}</p>
                      <p className="text-sm text-muted-foreground">Activity level</p>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{group.description}</p>
                  </div>
                )}

                {group.current_book && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Currently Reading</h4>
                    <p className="text-muted-foreground">{group.current_book}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Group Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet. Be the first to share something!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.profile.profile_picture_url} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <ClickableUserName
                                  name={post.profile.name}
                                  userId={post.user_id}
                                  onUserClick={onViewProfile}
                                  className="font-medium text-sm"
                                />
                                <span className="text-xs text-muted-foreground">@{post.profile.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{post.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'chat' ? (
          <GroupChat groupId={groupId} groupName={group.name} onClose={() => {}} />
        ) : (
          <GroupMembers 
            isOpen={true}
            onClose={() => {}}
            groupId={groupId}
            groupName={group.name}
            onViewProfile={onViewProfile}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};