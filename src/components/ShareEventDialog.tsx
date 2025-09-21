import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Twitter, Facebook, Instagram, MessageCircle, Link as LinkIcon, Share2, Calendar, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

interface ShareEventData {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  location: string;
  type: string;
  category: string;
}

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareEventData | null;
}

export function ShareEventDialog({ open, onOpenChange, data }: ShareEventDialogProps) {
  const { toast } = useToast();

  const appUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard?tab=events&event=${data?.id}` : "";
  const shareText = React.useMemo(() => {
    if (!data) return "";
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    const snippet = data.description?.trim() ? ` — ${data.description.slice(0, 100)}${data.description.length > 100 ? "…" : ""}` : "";
    return `Join me at "${data.title}" on ${formatDate(data.date)} at ${data.time} in ${data.location}!${snippet}`;
  }, [data]);

  const fullShare = `${shareText}${appUrl ? ` ${appUrl}` : ""}`.trim();

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}${appUrl ? `&url=${encodeURIComponent(appUrl)}` : ""}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl || "")}&quote=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShare)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShare);
      toast({ title: "Copied!", description: "Event details copied to clipboard." });
    } catch (e) {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const shareViaDevice = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({ title: `Event: ${data.title}`, text: shareText, url: appUrl || undefined });
      } catch {
        // user canceled or not supported
      }
    } else {
      copyToClipboard();
    }
  };

  const handleInstagram = async () => {
    await copyToClipboard();
    window.open("https://www.instagram.com/", "_blank");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'book-club': return 'bg-primary/10 text-primary';
      case 'author-talk': return 'bg-accent/10 text-accent';
      case 'workshop': return 'bg-blue-500/10 text-blue-600';
      case 'social': return 'bg-green-500/10 text-green-600';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>
            Invite friends to join this book event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-base font-semibold text-card-foreground line-clamp-2">{data.title}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getCategoryColor(data.category)}>
                {data.category.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.type}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(data.date)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {data.time}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {data.location}
            </div>
          </div>
          
          {data.description?.trim() && (
            <p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" className="w-full gap-2" aria-label="Share on Twitter">
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" className="w-full gap-2" aria-label="Share on WhatsApp">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" className="w-full gap-2" aria-label="Share on Facebook">
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          </a>
          <Button onClick={handleInstagram} variant="accent" className="w-full gap-2" aria-label="Prepare Instagram share">
            <Instagram className="h-4 w-4" />
            Instagram
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={copyToClipboard} aria-label="Copy share text">
            <LinkIcon className="h-4 w-4" />
            Copy link & text
          </Button>
          <Button variant="default" className="gap-2" onClick={shareViaDevice} aria-label="Share via device">
            <Share2 className="h-4 w-4" />
            Share…
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}