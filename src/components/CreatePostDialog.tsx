import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommunity } from "@/context/CommunityContext";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostDialog = ({ open, onOpenChange }: CreatePostDialogProps) => {
  const [content, setContent] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [threadContent, setThreadContent] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const { addPost } = useCommunity();
  const { toast } = useToast();

  const MAX_CHARS = 200;
  const charactersLeft = MAX_CHARS - content.length;
  const progressPercentage = (content.length / MAX_CHARS) * 100;

  const handleSubmit = () => {
    if (!content.trim()) return;

    const newPost = {
      id: `p${Date.now()}`,
      author: {
        name: 'You',
        avatar: '',
        level: 1,
        isFollowing: false
      },
      content: content.trim(),
      bookTitle: bookTitle.trim() || undefined,
      bookAuthor: bookAuthor.trim() || undefined,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: threadContent.trim() ? [{
        id: `r${Date.now()}`,
        author: { name: 'You' },
        content: threadContent.trim(),
        timestamp: new Date()
      }] : []
    };

    addPost(newPost);
    
    toast({
      title: "Post created!",
      description: `Your post has been shared with the community. You earned ${isThreadMode ? 15 : 10} XP!`,
    });

    // Reset form
    setContent("");
    setBookTitle("");
    setBookAuthor("");
    setThreadContent("");
    setIsThreadMode(false);
    onOpenChange(false);
  };

  const handleThreadToggle = () => {
    setIsThreadMode(!isThreadMode);
    if (!isThreadMode) {
      setThreadContent("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Information (Optional) */}
          <Card className="p-4 bg-secondary/50">
            <Label className="text-sm font-medium mb-2 block">Currently Reading (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Book title"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Input
                  placeholder="Author name"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Main Post Content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Share your thoughts</Label>
            <Textarea
              placeholder="What's on your mind about books, reading, or literature?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={MAX_CHARS}
            />
            
            {/* Character Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="w-20 h-2" />
                <Badge 
                  variant={charactersLeft < 20 ? "destructive" : charactersLeft < 50 ? "default" : "outline"}
                  className="text-xs"
                >
                  {charactersLeft} left
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleThreadToggle}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {isThreadMode ? "Remove Thread" : "Add Thread"}
              </Button>
            </div>
          </div>

          {/* Thread Content */}
          {isThreadMode && (
            <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
              <Label className="text-sm font-medium mb-2 block">Continue your thoughts in a thread</Label>
              <Textarea
                placeholder="Share your full thoughts here without character limits..."
                value={threadContent}
                onChange={(e) => setThreadContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This will appear as a reply to your main post
              </p>
            </Card>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isThreadMode ? "Posting with thread (+15 XP)" : "Regular post (+10 XP)"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > MAX_CHARS}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};