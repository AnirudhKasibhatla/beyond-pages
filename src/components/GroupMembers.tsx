import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    name: string;
    username: string;
    profile_picture_url: string | null;
    bio: string | null;
  };
}

interface GroupMembersProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onViewProfile: (userId: string) => void;
}

export const GroupMembers = ({ isOpen, onClose, groupId, groupName, onViewProfile }: GroupMembersProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && groupId) {
      fetchMembers();
      fetchCreator();
    }
  }, [isOpen, groupId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      // Fetch profiles separately
      const memberProfiles = await Promise.all(
        data.map(async (membership) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, username, profile_picture_url')
            .eq('user_id', membership.user_id)
            .single();

          return {
            ...membership,
            profile: {
              name: profileData?.name || 'Unknown User',
              username: profileData?.username || 'unknown',
              profile_picture_url: profileData?.profile_picture_url || null,
              bio: null
            }
          };
        })
      );

      setMembers(memberProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchCreator = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('book_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', groupData.creator_id)
        .single();

      if (creatorError) throw creatorError;

      setCreator(creatorData);
    } catch (error) {
      console.error('Error fetching creator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    onViewProfile(userId);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-8">
            Loading members...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {groupName} Members
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group Creator */}
          {creator && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Creator</h4>
              <Card className="p-4 bg-gradient-primary/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={creator.profile_picture_url} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{creator.name}</h5>
                      <Crown className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">@{creator.username}</p>
                    {creator.bio && (
                      <p className="text-xs text-muted-foreground mt-1">{creator.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(creator.user_id)}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Group Members */}
          {members.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Members ({members.length})
              </h4>
              <div className="space-y-3">
                {members.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile.profile_picture_url} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{member.profile.name}</h5>
                          {member.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{member.profile.username}</p>
                        {member.profile.bio && (
                          <p className="text-xs text-muted-foreground mt-1">{member.profile.bio}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(member.user_id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No members found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};