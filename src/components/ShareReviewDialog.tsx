import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Twitter, Facebook, Instagram, MessageCircle, Link as LinkIcon, Share2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

interface ShareData {
  title: string;
  author: string;
  rating: number;
  reviewText?: string;
}

interface ShareReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareData | null;
}

export function ShareReviewDialog({ open, onOpenChange, data }: ShareReviewDialogProps) {
  const { toast } = useToast();

  const appUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "";
  const shareText = React.useMemo(() => {
    if (!data) return "";
    const snippet = data.reviewText?.trim() ? ` — ${data.reviewText.slice(0, 120)}${data.reviewText.length > 120 ? "…" : ""}` : "";
    return `I just rated "${data.title}" ${data.rating}/5 on Beyond Pages!${snippet}`;
  }, [data]);

  const fullShare = `${shareText}${appUrl ? ` ${appUrl}` : ""}`.trim();

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}${appUrl ? `&url=${encodeURIComponent(appUrl)}` : ""}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl || "")}\u0026quote=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShare)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShare);
      toast({ title: "Copied!", description: "Share text copied to clipboard." });
    } catch (e) {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const shareViaDevice = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({ title: `Review: ${data.title}`, text: shareText, url: appUrl || undefined });
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

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your review</DialogTitle>
          <DialogDescription>
            Let friends know what you thought about this book.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-base font-semibold text-card-foreground line-clamp-2">{data.title}</div>
            <div className="text-sm text-muted-foreground">by {data.author}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{data.rating}/5</span>
            </div>
            <Badge variant="outline" className="text-xs">Review</Badge>
          </div>
          {data.reviewText?.trim() && (
            <p className="text-sm text-muted-foreground line-clamp-3">{data.reviewText}</p>
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
