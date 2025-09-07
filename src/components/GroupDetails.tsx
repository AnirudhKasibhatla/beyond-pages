import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, BookOpen, MapPin, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GroupChat } from "./GroupChat";
import { GroupMembers } from "./GroupMembers";

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
  const [activeTab, setActiveTab] = useState("feed");
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{group.name}</DialogTitle>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{group.current_members}/{group.total_slots} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{group.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{group.genre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">{group.activity_level}</Badge>
                </div>
              </div>
              {group.current_book && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Currently Reading:</p>
                  <p className="text-sm text-muted-foreground">{group.current_book}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Group Feed</CardTitle>
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
                                  <span className="font-medium text-sm">{post.profile.name}</span>
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
            </TabsContent>

            <TabsContent value="chat">
              <GroupChat groupId={groupId} />
            </TabsContent>

            <TabsContent value="members">
              <div className="bg-background">
                <GroupMembers 
                  isOpen={true}
                  onClose={() => {}}
                  groupId={groupId}
                  groupName={group.name}
                  onViewProfile={onViewProfile}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};