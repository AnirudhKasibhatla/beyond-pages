import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Share2, UserPlus, UserMinus, Send, Plus } from "lucide-react";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";
import { useCommunity, type CommunityPost, type Reply } from "@/context/CommunityContext";

// Types imported from context

export const Community = () => {
  const { posts, setPosts } = useCommunity();

  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();

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

    const newReply: Reply = {
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
      description: "Your reply has been posted. You earned 5 XP!",
    });
  };

  const sharePost = (post: CommunityPost) => {
    toast({
      title: "Shared!",
      description: `Shared ${post.author.name}'s post about "${post.bookTitle}"`,
    });
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
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold text-foreground">Community</h2>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-sm px-4 py-2 w-fit">
            {posts.filter(p => p.author.isFollowing).length} Following
          </Badge>
          <Button onClick={() => setIsCreatePostOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getAuthorInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col space-y-1 md:flex-row md:items-center md:gap-2 md:space-y-0">
                      <h4 className="font-semibold text-card-foreground truncate">{post.author.name}</h4>
                      <Badge variant="outline" className="text-xs w-fit">
                        Level {post.author.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(post.timestamp)}
                    </p>
                  </div>
                </div>
                <Button
                  variant={post.author.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleFollow(post.id)}
                  className="gap-2 w-full md:w-auto flex-shrink-0"
                >
                  {post.author.isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span className="hidden sm:inline">Unfollow</span>
                      <span className="sm:hidden">Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Follow</span>
                      <span className="sm:hidden">Follow</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Book Info */}
              {post.bookTitle && (
                <Card className="p-4 bg-secondary/50 border-l-4 border-l-primary">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">📚 Reading</Badge>
                    <span className="font-medium text-card-foreground">{post.bookTitle}</span>
                    <span className="text-muted-foreground">by {post.bookAuthor}</span>
                  </div>
                </Card>
              )}

              {/* Post Content */}
              <p className="text-card-foreground leading-relaxed">{post.content}</p>

              {/* Post Actions */}
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-6 md:space-y-0 pt-2">
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`gap-2 flex-1 md:flex-none ${post.isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="hidden xs:inline">{post.likes}</span>
                    <span className="xs:hidden">{post.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="gap-2 flex-1 md:flex-none"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden xs:inline">{post.replies.length} Replies</span>
                    <span className="xs:hidden">{post.replies.length}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost(post)}
                    className="gap-2 flex-1 md:flex-none"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Share</span>
                    <span className="xs:hidden">Share</span>
                  </Button>
                </div>
              </div>

              {/* Replies */}
              {post.replies.length > 0 && (
                <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-secondary text-xs">
                            {getAuthorInitials(reply.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{reply.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(reply.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-card-foreground ml-8">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {showReplyForm[post.id] && (
                <div className="space-y-3 ml-6">
                  <Separator />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyInputs[post.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => addReply(post.id)}
                      disabled={!replyInputs[post.id]?.trim()}
                      className="gap-2 self-end"
                    >
                      <Send className="h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Community Stats */}
      <Card className="p-6 bg-gradient-accent text-center">
        <h3 className="text-lg font-semibold text-accent-foreground mb-2">
          Community Engagement
        </h3>
        <p className="text-accent-foreground/80">
          Join the conversation and earn XP! Create posts (+10 XP), reply to posts (+5 XP), post threads (+15 XP)
        </p>
      </Card>

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
};