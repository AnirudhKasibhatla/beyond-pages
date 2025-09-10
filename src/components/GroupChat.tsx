import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Heart, MessageCircle, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  message_type: 'message' | 'post';
  created_at: string;
  user_name?: string;
}

export const GroupChat = ({ groupId, groupName, onClose }: GroupChatProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'message' | 'post'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newPost,
          message_type: 'post'
        });

      if (error) throw error;

      setNewPost('');
      loadMessages();
      
      toast({
        title: "Post shared!",
        description: "Your thought has been shared with the group.",
      });
    } catch (error) {
      console.error('Error posting message:', error);
      toast({
        title: "Error",
        description: "Failed to post message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessageSubmit = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newMessage,
          message_type: 'message'
        });

      if (error) throw error;

      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUserName = (message: Message) => {
    if (message.user_id === user?.id) {
      return profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'You';
    }
    return message.user_name || 'User';
  };

  const posts = messages.filter(m => m.message_type === 'post');
  const chatMessages = messages.filter(m => m.message_type === 'message');

  return (
    <div className="w-full h-[60vh] flex flex-col overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-2 p-4">
          <Button 
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            size="sm"
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Posts & Thoughts
          </Button>
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            size="sm"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Group Chat
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden">
          {activeTab === 'posts' ? (
            <div className="h-full flex flex-col space-y-4">
              {/* New Post Input */}
              <Card className="p-4 flex-shrink-0">
                <div className="space-y-3">
                  <Input
                    placeholder="Share your thoughts about the book..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostSubmit()}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handlePostSubmit} disabled={!newPost.trim()} className="gap-2">
                      <Send className="h-4 w-4" />
                      Share Post
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Posts List */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-card-foreground">{getUserName(post)}</h4>
                              <p className="text-sm text-muted-foreground">{formatTime(post.created_at)}</p>
                            </div>
                          </div>
                          <p className="text-card-foreground leading-relaxed">{post.content}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-4">
              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-3 rounded-lg ${
                          message.user_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm font-medium mb-1">{getUserName(message)}</p>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{formatTime(message.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* New Message Input */}
              <Card className="p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleMessageSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleMessageSubmit} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
};