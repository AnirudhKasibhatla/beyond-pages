import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCommunity } from "@/context/CommunityContext";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  CheckCircle, 
  PlusCircle, 
  Star, 
  Clock,
  Book,
  Repeat2,
  Home
} from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { useNavigate } from "react-router-dom";

import type { CommunityPost } from "@/context/CommunityContext";

export const Community = () => {
  const { posts, setPosts, addPost } = useCommunity();
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [quickPostContent, setQuickPostContent] = useState("");
  const [showThreadSection, setShowThreadSection] = useState(false);
  const [threadContent, setThreadContent] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const toggleFollow = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            author: { ...post.author, isFollowing: !post.author.isFollowing }
          }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    if (post) {
      toast({
        title: post.author.isFollowing ? "Unfollowed" : "Following",
        description: `You ${post.author.isFollowing ? 'unfollowed' : 'are now following'} ${post.author.name}`,
      });
    }
  };

  const addReply = (postId: string) => {
    const replyContent = replyInputs[postId];
    if (!replyContent?.trim()) return;

    const newReply = {
      id: `r${Date.now()}`,
      author: { name: 'You' },
      content: replyContent,
      timestamp: new Date()
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    ));

    setReplyInputs(prev => ({ ...prev, [postId]: '' }));
    setShowReplyForm(prev => ({ ...prev, [postId]: false }));
    
    toast({
      title: "Reply added!",
      description: "Your reply has been posted.",
    });
  };

  const sharePost = (post: CommunityPost) => {
    toast({
      title: "Post shared!",
      description: "The post has been shared to your network.",
    });
  };

  const repostPost = (post: CommunityPost) => {
    const repost = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      isRepost: true,
      originalAuthor: post.author,
      author: {
        name: "Current User",
        avatar: "",
        level: 1,
        isFollowing: false
      },
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };
    addPost(repost);
    toast({
      title: "Post reposted!",
      description: "You've successfully reposted this content.",
    });
  };

  const handleQuickPost = () => {
    if (quickPostContent.trim()) {
      const postData: any = {
        content: quickPostContent,
      };
      
      // Add thread content if available
      if (showThreadSection && threadContent.trim()) {
        postData.threadContent = threadContent;
      }
      
      addPost(postData);
      setQuickPostContent("");
      setThreadContent("");
      setShowThreadSection(false);
      toast({
        title: "Post created!",
        description: "Your reading thoughts have been shared with the community.",
      });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
      </div>

      {/* Quick Post Textarea */}
      <Card className="p-4 mb-6">
        <div className="space-y-3">
          <Textarea
            placeholder="Reading thoughts?"
            value={quickPostContent}
            onChange={(e) => setQuickPostContent(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {quickPostContent.length}/280
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThreadSection(!showThreadSection)}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Thread
              </Button>
              <Button
                onClick={handleQuickPost}
                disabled={!quickPostContent.trim() || quickPostContent.length > 280}
                size="sm"
              >
                Post
              </Button>
            </div>
          </div>
          
          {/* Thread Section */}
          {showThreadSection && (
            <div className="space-y-3 pt-3 border-t border-border">
              <Textarea
                placeholder="Continue your thread..."
                value={threadContent}
                onChange={(e) => setThreadContent(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {threadContent.length}/280
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowThreadSection(false);
                    setThreadContent("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
            {post.isRepost && (
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Repeat2 className="h-4 w-4" />
                <span>Reposted from {post.originalAuthor?.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getAuthorInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-card-foreground">{post.author.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Level {post.author.level}
                  </Badge>
                  {post.author.isFollowing && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(post.timestamp)}
                </span>
              </div>
              <Button
                variant={post.author.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => toggleFollow(post.id)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {post.author.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Book info */}
            {post.bookTitle && (
              <Card className="p-3 mb-4 bg-secondary/30 border-l-4 border-l-primary">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{post.bookTitle}</span>
                  {post.bookAuthor && (
                    <span className="text-sm text-muted-foreground">by {post.bookAuthor}</span>
                  )}
                  {post.rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < post.rating! ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            <p className="text-card-foreground mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`gap-2 ${post.isLiked ? 'text-destructive' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.replies?.length || 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => repostPost(post)}
                    className="gap-2"
                  >
                    <Repeat2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost(post)}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-secondary text-xs">
                          {getAuthorInitials(reply.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-card-foreground">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {showReplyForm[post.id] && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyInputs[post.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => addReply(post.id)}
                      disabled={!replyInputs[post.id]?.trim()}
                      size="sm"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              )}
          </Card>
        ))}
      </div>

      {/* Community engagement card */}
      <Card className="p-6 bg-gradient-accent text-center">
        <Star className="h-8 w-8 mx-auto mb-4 text-accent-foreground" />
        <h3 className="text-lg font-semibold text-accent-foreground mb-2">
          Community Engagement
        </h3>
        <p className="text-accent-foreground/80">
          Join the conversation! Share your reading thoughts, discover new books, and connect with fellow readers.
        </p>
      </Card>

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
};