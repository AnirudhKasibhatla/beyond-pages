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

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  comments: number;
}

export const GroupChat = ({ groupId, groupName, onClose }: GroupChatProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    setPosts([
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        content: 'Just finished chapter 5 of our current book! The plot twist was incredible. What did everyone think about the main character\'s decision?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 8,
        isLiked: false,
        comments: 3
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Chen',
        content: 'I loved how the author built up the suspense. Can\'t wait to discuss this at our next meeting!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 5,
        isLiked: true,
        comments: 1
      }
    ]);

    setMessages([
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        content: 'Hey everyone! Ready for tonight\'s discussion?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        likes: 2,
        isLiked: false
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Chen',
        content: 'Absolutely! I have so many thoughts about this book.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        likes: 1,
        isLiked: false
      }
    ]);
  }, []);

  const handlePostSubmit = () => {
    if (!newPost.trim() || !user || !profile) return;

    const post: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'You',
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      comments: 0
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    
    toast({
      title: "Post shared!",
      description: "Your thought has been shared with the group.",
    });
  };

  const handleMessageSubmit = () => {
    if (!newMessage.trim() || !user || !profile) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'You',
      content: newMessage,
      timestamp: new Date(),
      likes: 0,
      isLiked: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const toggleLike = (id: string, type: 'post' | 'message') => {
    if (type === 'post') {
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    } else {
      setMessages(prev => prev.map(message => 
        message.id === id 
          ? { ...message, likes: message.isLiked ? message.likes - 1 : message.likes + 1, isLiked: !message.isLiked }
          : message
      ));
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{groupName}</h2>
              <p className="text-muted-foreground">Group Discussion</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <Button 
              variant={activeTab === 'posts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('posts')}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Posts & Thoughts
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Group Chat
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'posts' ? (
            <div className="space-y-4">
              {/* New Post Input */}
              <Card className="p-4">
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
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-card-foreground">{post.userName}</h4>
                            <p className="text-sm text-muted-foreground">{formatTime(post.timestamp)}</p>
                          </div>
                        </div>
                        <p className="text-card-foreground leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleLike(post.id, 'post')}
                            className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs p-3 rounded-lg ${
                        message.userId === user?.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm font-medium mb-1">{message.userName}</p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* New Message Input */}
              <Card className="p-4">
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
      </Card>
    </div>
  );
};